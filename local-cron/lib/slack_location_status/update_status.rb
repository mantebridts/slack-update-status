require 'net/http'
require 'uri'
require 'json'

module SlackLocationStatus
  # Set the emoji and status text on Slack
  class UpdateStatus
    def self.post(message: '', emoji: '')
      uri = URI.parse('http://localhost:3000/location')

      header = {'Content-Type': 'application/json'}
      payload = { token: SlackLocationStatus::Config.config['oauth_key'], status: { status_text: message, status_emoji: emoji } }

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = false
      request = Net::HTTP::Post.new(uri.request_uri, header)
      request.body = payload.to_json

      response = http.request(request)
      response
    end
  end
end
