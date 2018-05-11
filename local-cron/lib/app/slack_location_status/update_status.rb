require 'net/http'
require 'uri'
require 'json'

module SlackLocationStatus
  # Set the emoji and status text on Slack
  class UpdateStatus
    def self.post(token: '', address: '')
      uri = URI.parse('https://api.nightknight.be/location')
      # uri = URI.parse('http://localhost/location')

      header = {'Content-Type' => 'application/json'}
      payload = { 'token' => token, 'address' => address.encode("iso-8859-1").force_encoding("utf-8") }

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      request = Net::HTTP::Post.new(uri.request_uri, header)
      request.body = payload.to_json

      response = http.request(request)
      response
    end
  end
end
