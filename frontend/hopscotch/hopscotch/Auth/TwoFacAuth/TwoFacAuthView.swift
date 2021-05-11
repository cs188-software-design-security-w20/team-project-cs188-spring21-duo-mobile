//
//  TwoFacAuthView.swift
//  hopscotch
//
//  Created by Max Wu on 5/10/21.
//

import SwiftUI
import Combine


struct ProceedIntoAppView: View {
    var body: some View {
        VStack {
            Text("Proceed")
        }
    }
}

struct TwoFacAuthView: View {
    
    @EnvironmentObject var auth: AuthStore
    @State private var test: String? = nil
    @State private var testCancellable: Cancellable? = nil
    
    
    enum NavigationStage: Hashable {
        case enterPhoneNumber
        case enterVerificationCode
        case proceedIntoApp
    }
    @State private var navStage: NavigationStage? = .enterPhoneNumber
    
    var body: some View {
        NavigationView {
            VStack {
                NavigationLink(
                    destination:
                        EnterPhoneNumberView(){
                            print("WEDUNNIT")
                            self.navStage = .enterVerificationCode
                        },
                    tag: .enterPhoneNumber,
                    selection: $navStage,
                    label: { EmptyView() })
                
                NavigationLink(
                    destination: EnterVerificationCodeView(handleProceed: {
                        // Do nothing
                    }),
                    tag: .enterVerificationCode,
                    selection: $navStage,
                    label: { EmptyView() })
                
                
                Button("Enter your phone number") {
                    self.navStage = .enterPhoneNumber
                }
            }
            .navigationTitle("Two-factor auth")
            
        }
    }
}

struct TwoFacAuthView_Previews: PreviewProvider {
    static var previews: some View {
        TwoFacAuthView().environmentObject(AuthStore())
    }
}
