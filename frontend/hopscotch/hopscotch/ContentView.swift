//
//  ContentView.swift
//  hopscotch
//
//  Created by Max Wu on 5/7/21.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var auth: AuthStore
    
    var body: some View {
        Group {
            if (auth.session != nil) {
                Group {
                    if (auth.twilioAuthToken != nil) {
                        VStack {
                            Text("Hello user!")
                            Text("Firebase uid: \(auth.session!.user.uid)")
                            Text("Twilio Token: \(auth.twilioAuthToken!)")
                            Button(action: { _ = auth.signOut() }) {
                                Text("Sign Out")
                            }
                        }
                    } else {
                        TwoFacAuthView()
                    }
                }
            } else {
                AuthView()
            }
        }.onAppear {
            auth.listen()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView().environmentObject(AuthStore())
    }
}
