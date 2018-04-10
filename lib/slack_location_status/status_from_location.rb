module SlackLocationStatus
  class StatusFromLocation
    def self.location
      @location = `CoreLocationCLI -format "%address"`
    end

    def self.set_status
      config = SlackLocationStatus::Config.config
      loc = self.location
      validated = false
      for key in config.keys.sort
        if !config[key]["address"].nil?
          if loc.include?(config[key]["address"][0])
            validated = true
            SlackLocationStatus::UpdateStatus.post({message: config[key]["slack"]["message"], emoji: config[key]["slack"]["emoji"]})
          end
        end
      end
      if !validated
        SlackLocationStatus::UpdateStatus.post({message: config["else"]["slack"]["message"], emoji: config["else"]["slack"]["emoji"]})
      end
    end
  end
end
