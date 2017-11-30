module SlackWifiStatus
  class StatusFromWifi

    ##
    # Get the current connected ssid
    ##

    def self.ssid
      @ssid ||= `/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | awk '/ SSID/ {print substr($0, index($0, $2))}'`.chomp
    end

    ##
    # Is the connected ssid in the ssid-list from a place?
    ##

    def self.kontich_ssid?
      SlackWifiStatus::Config.config['kontich_ssids'].include?(ssid)
    end

    def self.gent_ssid?
      SlackWifiStatus::Config.config['gent_ssids'].include?(ssid)
    end

    def self.antwerpen_ssid?
      SlackWifiStatus::Config.config['antwerpen_ssids'].include?(ssid)
    end

    def self.home_ssid?
      SlackWifiStatus::Config.config['home_ssids'].include?(ssid)
    end

    def self.ontheroad_ssid?
      puts SlackWifiStatus::Config.config['ontheroad_ssids']
      SlackWifiStatus::Config.config['ontheroad_ssids'].include?(ssid)
    end

    ##
    # Check wich ssid is set
    ##

    def self.status_hash
      if kontich_ssid?
        { message: '', emoji: ':kontich:' }
      elsif gent_ssid?
        { message: '', emoji: ':gent:' }
      elsif antwerpen_ssid?
        { message: '', emoji: ':antwerp:' }
      elsif home_ssid?
        { message: '', emoji: ':house:' }
      elsif ontheroad_ssid?
        { message: '', emoji: '' }
      else
        { message: '', emoji: '' }
      end
    end

    def self.set_status
      SlackWifiStatus::UpdateStatus.post(status_hash)
    end
  end
end
