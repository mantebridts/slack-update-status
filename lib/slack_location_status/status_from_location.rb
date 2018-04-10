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
      validated = false
      for config_location in config.keys.sort
        if !config[config_location]["address"].nil?
          for possible_match in config[config_location]["address"]
            if self.location.include?(possible_match)
              validated = true
              puts "-------------------------------------------"
              puts "Location " + possible_match + " found in address!"
              puts "Message: " + config[config_location]["slack"]["message"]
              puts "Emoji: " + config[config_location]["slack"]["emoji"]
              puts "-------------------------------------------"
              SlackLocationStatus::UpdateStatus.post({message: config[config_location]["slack"]["message"], emoji: config[config_location]["slack"]["emoji"]})
            end
          end
        end
      end
      if !validated
        puts "-------------------------------------------"
        puts "No address match found."
        puts "Message: " + config["else"]["slack"]["message"]
        puts "Emoji: " + config["else"]["slack"]["emoji"]
        puts "-------------------------------------------"
        SlackLocationStatus::UpdateStatus.post({message: config["else"]["slack"]["message"], emoji: config["else"]["slack"]["emoji"]})
      end
    end
  end
end
