//
//  EnterVerificationCodeView.swift
//  hopscotch
//
//  Created by Max Wu on 5/11/21.
//

import SwiftUI
import Combine

class EnterVerificationCodeViewState: ObservableObject {
    var getVerifCodeCancellable: Cancellable? = nil
    var sendVerifCodeCancellable: Cancellable? = nil
    @Published var loading: Bool = false
    @Published var textSent: Bool = false
    @Published var verificationCode: String = ""
    
    
    // GET request to initialize 2-fac session
    struct GetTwoFacSessIdResponseJSON: Codable {
        var sessionId: String
    }
    func getTwoFacSessId(authStore: AuthStore, callback: @escaping () -> ()) {
        self.loading = true
        self.textSent = false
        self.getVerifCodeCancellable = authStore.firebaseAuthGet(
            url: "\(Config.API_URL)/api/auth/init2facSession")
            .tryMap { (response: Response<GetTwoFacSessIdResponseJSON>) -> Void in
                print(response.value)
                authStore.twilioSessionId = response.value.sessionId
                self.loading = false
                self.textSent = true
                callback()
            }.sink(receiveCompletion: {_ in}, receiveValue: {_ in})
        
    }
    
    // Send 2-fac verification code received via text
    struct SendVerifCodeRequestJSON: Codable {
        var sessionId: String
        var code: String
    }
    struct SendVerifCodeResponseJSON: Codable {
        var token: String
    }
    func enterVerificationCode(authStore: AuthStore, code: String, callback: @escaping () -> ()) {
        if (authStore.twilioSessionId == nil) {
            return
        }
        self.loading = true
        self.sendVerifCodeCancellable?.cancel()
        self.sendVerifCodeCancellable = authStore.firebaseAuthPost(
            url: "\(Config.API_URL)/api/auth/complete2fac",
            body: SendVerifCodeRequestJSON(
                sessionId: authStore.twilioSessionId!,
                code: code
            ))
            .tryMap { (response: Response<SendVerifCodeResponseJSON>) -> Void in
                print(response)
                authStore.twilioAuthToken = response.value.token
                self.loading = false
                callback()
            }.sink(receiveCompletion: {_ in}, receiveValue: {_ in})
    }
}

struct EnterVerificationCodeView: View {
    @EnvironmentObject var auth: AuthStore
    var handleProceed: () -> ()
    
    @StateObject private var state = EnterVerificationCodeViewState()
    
    
    var body: some View {
        VStack {
            Text("Your phone number is \(auth.userPhoneNumber).")
            Text("Click below to send a verification text.")
            
            
            Button("Send Verification Text") {
                state.getTwoFacSessId(authStore: auth) {
                    
                }
            }
            
            if (state.textSent) {
                VStack {
                    Text("Session Id: \(auth.twilioSessionId!)")
                    TextField("Enter Verification Code", text: $state.verificationCode)
                    Button("Enter Code") {
                        state.enterVerificationCode(authStore: auth, code: state.verificationCode) {
                            handleProceed()
                        }
                    }
                }
            }
            
            
            if (auth.twilioAuthToken != nil) {
                Text("Auth token: \(auth.twilioAuthToken!)")
            }
            
        }
    }
}

struct EnterVerificationCodeView_Previews: PreviewProvider {
    static var previews: some View {
        EnterVerificationCodeView(handleProceed: {})
    }
}
