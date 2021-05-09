//
//  AuthSessionStore.swift
//  hopscotch
//
//  Created by Max Wu on 5/8/21.
//

import Foundation
import SwiftUI
import Firebase
import Combine

// https://benmcmahen.com/authentication-with-swiftui-and-firebase/

class User {
    var uid: String
    var email: String?
    var displayName: String?

    init (uid: String, displayName: String? = nil, email: String? = nil) {
        self.uid = uid
        self.email = email
        self.displayName = displayName
    }
}

class Session {
    var user: User
    
    init(user: User) {
        self.user = user
    }
}

class AuthStore : ObservableObject {
    @Published var didChange = PassthroughSubject<AuthStore, Never>()
    @Published var session: Session? { didSet { self.didChange.send(self) }}
    @Published var handle: AuthStateDidChangeListenerHandle? = nil
    
    func signUp(email: String, password: String, handler: @escaping AuthDataResultCallback) {
        Auth.auth().createUser(withEmail: email, password: password, completion: handler)
    }

    func signIn(email: String, password: String, handler: @escaping AuthDataResultCallback) {
        Auth.auth().signIn(withEmail: email, password: password, completion: handler)
    }
    
    func signOut () -> Bool {
        do {
            try Auth.auth().signOut()
            self.session = nil
            return true
        } catch {
            return false
        }
    }
    
    func unsubscribe () {
        if let handle = handle {
            Auth.auth().removeStateDidChangeListener(handle)
        }
    }

    func listen () {
        // monitor authentication changes using firebase
        handle = Auth.auth().addStateDidChangeListener { (auth, user) in
            if let user = user {
                // if we have a user, create a new user model
                print("Got user: \(user)")
                self.session = Session(user: User(
                    uid: user.uid,
                    displayName: user.displayName
                ))
            } else {
                // if we don't have a user, set our session to nil
                self.session = nil
            }
        }
    }

    // additional methods (sign up, sign in) will go here
}
