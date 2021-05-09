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
                VStack {
                    Text("Hello user!")
                    Button(action: { _ = auth.signOut() }) {
                        Text("Sign Out")
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
