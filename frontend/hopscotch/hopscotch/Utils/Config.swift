//
//  Utils.swift
//  hopscotch
//
//  Created by Max Wu on 5/9/21.
//

import Foundation

class Config : ObservableObject {
    private var plistDict: NSDictionary?
    
    @Published var API_URL: String
    init() {
        if let path = Bundle.main.path(forResource: "Config", ofType: "plist") {
            plistDict = NSDictionary(contentsOfFile: path)
        }
        API_URL = plistDict!["API_URL"] as! String
    }
}


