module SlackLocationStatus
  class StatusFromLocation
    def self.location
      @location ||= `/usr/local/bin/CoreLocationCLI -format "%address"`
    end

    def self.set_status
      config = SlackLocationStatus::Config.config
      puts "Location used:"
      puts "--------------"
      puts self.location
      puts "--------------"      
      SlackLocationStatus::UpdateStatus.post({address: self.location})
    end
  end
end
