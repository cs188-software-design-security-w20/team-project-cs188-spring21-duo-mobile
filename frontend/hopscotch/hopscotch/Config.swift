//
//  Config.swift
//  hopscotch
//
//  Created by Max Wu on 5/9/21.
//

import Foundation

struct Config {
    private static var plistDict: NSDictionary? {
        if let path = Bundle.main.path(forResource: "Config", ofType: "plist") {
            let dict = NSDictionary(contentsOfFile: path)
            return dict
        } else {
            return nil
        }
    }
    
    static let API_URL: String = plistDict!["API_URL"] as! String
}


