module SlackLocationStatus
  class StatusFromLocation
    def self.location
      path = File.join(File.dirname(__FILE__), '../../../bin/CoreLocationCLI -format "%address"')
      @location ||= `#{path}`
    end

    def self.set_status(token: '')
      if token == nil || token == ""
        puts "No token provided"
      else
        puts "Location used:"
        puts "--------------"
        puts self.location
        puts "--------------"
        SlackLocationStatus::UpdateStatus.post({token: token, address: self.location})
      end
    end
  end
end
