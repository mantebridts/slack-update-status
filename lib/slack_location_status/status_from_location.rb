module SlackLocationStatus
  class StatusFromLocation
    def self.location
      @location = `/usr/local/bin/CoreLocationCLI -format "%address"`
    end

    def self.set_status
      config = SlackLocationStatus::Config.config
      loc = self.location
      puts "Location used: " + loc
      puts "---------"
      validated = false
      for config_location in config.keys.sort
        if !config[config_location]["address"].nil?
          for possible_match in config[config_location]["address"]
            if loc.include?(possible_match)
              validated = true
              puts "Location " + possible_match + " found in address!"
              SlackLocationStatus::UpdateStatus.post({message: config[config_location]["slack"]["message"], emoji: config[config_location]["slack"]["emoji"]})
            else
              puts "No match for " + possible_match
            end
          end
        end
      end
      if !validated
        SlackLocationStatus::UpdateStatus.post({message: config["else"]["slack"]["message"], emoji: config["else"]["slack"]["emoji"]})
      end
    end
  end
end
