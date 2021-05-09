//
//  hopscotchApp.swift
//  hopscotch
//
//  Created by Max Wu on 5/7/21.
//

import SwiftUI
import Firebase


// https://peterfriese.dev/swiftui-new-app-lifecycle-firebase/

class AppDelegate: NSObject, UIApplicationDelegate {
  func application(_ application: UIApplication,
                   didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    print("Colors application is starting up. ApplicationDelegate didFinishLaunchingWithOptions.")
    FirebaseApp.configure()
    return true
  }
}

@main
struct HopscotchApp: App {
    
    init() {
        FirebaseApp.configure()
    }
//    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
