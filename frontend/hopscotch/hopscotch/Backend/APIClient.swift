//
//  APIClient.swift
//  hopscotch
//
//  Created by Max Wu on 5/9/21.
//

import Foundation
import Combine


struct Response<T> {
    let value: T
    let response: URLResponse
}

struct BasicResponseJSON: Codable {
    var message: String
}

struct APIClient {
    
    enum APIClientError: Error {
        case encodeBodyError
    }
    
    static func get<T: Decodable>(url: String, firebaseToken: String? = nil, twilioToken: String? = nil) -> AnyPublisher<Response<T>, Error> {
        print("GET \(url)")
        var request = URLRequest(url: URL(string: url)!)
        request.httpMethod = "GET"
        
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        if firebaseToken != nil {
            request.addValue(firebaseToken!, forHTTPHeaderField: "login_token")
        }
        if twilioToken != nil {
            request.addValue(twilioToken!, forHTTPHeaderField: "two_fac_token")
        }
        
        return self.run(request)
    }
    
    static func post<S: Encodable, T: Decodable>(url: String, body: S, firebaseToken: String? = nil, twilioToken: String? = nil) -> AnyPublisher<Response<T>, Error> {
        print("POST \(url)")
        
        var request = URLRequest(url: URL(string: url)!)
        request.httpMethod = "POST"
        
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        
        let bodyObject: Data
        do {
            bodyObject = try encoder.encode(body)
        } catch _ {
            return Future<Response<T>, Error> { promise in
                promise(.failure(APIClientError.encodeBodyError))
                return
            }.eraseToAnyPublisher()
        }
        request.httpBody = bodyObject
        
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        if firebaseToken != nil {
            request.addValue(firebaseToken!, forHTTPHeaderField: "login_token")
        }
        if twilioToken != nil {
            request.addValue(twilioToken!, forHTTPHeaderField: "two_fac_token")
        }
        
        return self.run(request)
    }
    
    static func run<T: Decodable>(_ request: URLRequest) -> AnyPublisher<Response<T>, Error> {
        return URLSession.shared
            .dataTaskPublisher(for: request)
            .tryMap { result -> Response<T> in
                let value = try JSONDecoder().decode(T.self, from: result.data)
                return Response(value: value, response: result.response)
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
}
