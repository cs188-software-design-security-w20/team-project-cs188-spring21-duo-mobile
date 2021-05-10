//
//  AuthView.swift
//  hopscotch
//
//  Created by Max Wu on 5/8/21.
//

import SwiftUI
import Firebase



struct AuthView: View {
    
    @EnvironmentObject var auth: AuthStore
    @State var email: String = ""
    @State var password: String = ""
    @State var errorMessage: String? = nil
    
    
    func handleError(_: AuthDataResult?, error: Error?) -> Void {
        if error != nil {
            errorMessage = "\(error!.localizedDescription)"
        }
    }
    
    func handleLogin() {
        auth.signIn(email: email, password: password, handler: handleError)
    }
    
    func handleSignUp() {
        auth.signUp(email: email, password: password, handler: handleError)
    }
    
    var body: some View {
        VStack(alignment: .leading) {
            TextField("Email", text: $email)
                .autocapitalization(.none)
                .disableAutocorrection(true)
            SecureField("Password", text: $password)
            Text(Config.API_URL)
            if errorMessage != nil {
                Text(errorMessage!)
                    .font(.system(size: 12))
                    .foregroundColor(.red)
            }
            
            HStack {
                Button(action: handleLogin) {
                    Text("Login")
                }
                Button(action: handleSignUp) {
                    Text("Sign Up")
                }
            }
       }
       .padding()
    }
}

struct AuthView_Previews: PreviewProvider {
    
    static var previews: some View {
        AuthView().environmentObject(AuthStore())
    }
}
