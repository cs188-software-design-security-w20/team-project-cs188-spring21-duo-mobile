//
//  EnterPhoneNumberView.swift
//  hopscotch
//
//  Created by Max Wu on 5/10/21.
//

import SwiftUI
import Combine

struct PhoneNumberTextField: View {
    @Binding var phoneNumber: String
    
    var body: some View {
        TextField("Enter phone number", text: $phoneNumber)
            .keyboardType(.numberPad)
            .onReceive(Just(phoneNumber)) { newValue in
                let filtered = newValue.filter { "0123456789".contains($0) }
                if filtered != newValue {
                    self.phoneNumber = filtered
                }
            }
    }
}

class EnterPhoneNumberViewState: ObservableObject {
    @Published var loading: Bool = false
    private var savePhoneNumberCancellable: Cancellable? = nil
    
    struct SavePhoneNumberRequestJSON: Codable {
        var phone: String
    }
    
    struct SavePhoneNumberResponseJSON: Codable {
        var sessionId: String
    }
    
    func savePhoneNumber(authStore: AuthStore, callback: @escaping () -> ()) {
        self.loading = true
        self.savePhoneNumberCancellable?.cancel()
        
        self.savePhoneNumberCancellable = authStore.firebaseAuthPost(
            url: "\(Config.API_URL)/api/auth/register",
            body: SavePhoneNumberRequestJSON(
                phone: authStore.userPhoneNumber))
            .tryMap { (response: Response<BasicResponseJSON>) -> Void in
                print(response.value)
                self.loading = false
                callback()
            }.sink(receiveCompletion: {_ in}, receiveValue: {_ in})
    }
    
}

struct EnterPhoneNumberView: View {
    @EnvironmentObject var auth: AuthStore
    var handleProceed: () -> ()
    
    @StateObject private var state = EnterPhoneNumberViewState()
    
    var body: some View {
        VStack {
            TextField("Enter phone number here", text: $auth.userPhoneNumber).padding()
            Button("Proceed") {
                state.savePhoneNumber(authStore: auth) {
                    handleProceed()
                }
            }
            if state.loading {
                Text("loading...")
            }
        }
    }
}

struct EnterPhoneNumberView_Previews: PreviewProvider {
    static var previews: some View {
        EnterPhoneNumberView(handleProceed: {})
    }
}
