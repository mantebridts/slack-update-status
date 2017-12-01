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

    def self.check_ssid(ssid)
      if SlackWifiStatus::Config.config['kontich_ssids'].include?(ssid)
        connected_to = 'kontich'
      end

      if SlackWifiStatus::Config.config['gent_ssids'].include?(ssid)
        connected_to = 'gent'
      end

      if SlackWifiStatus::Config.config['antwerpen_ssids'].include?(ssid)
        connected_to = 'antwerpen'
      end

      if SlackWifiStatus::Config.config['home_ssids'].include?(ssid)
        connected_to = 'home'
      end

      if SlackWifiStatus::Config.config['ontheroad_ssids'].include?(ssid)
        connected_to = 'ontheroad'
      end

      return connected_to
    end

    ##
    # Check wich ssid is set
    ##

    def self.status_hash

      connected_to = check_ssid(ssid)

      case connected_to
      when 'kontich'
        { message: '', emoji: ':kontich:' }
      when 'gent'
        { message: '', emoji: ':gent:' }
      when 'antwerpen'
        { message: '', emoji: ':antwerp:' }
      when 'home'
        { message: '', emoji: ':house:' }
      when 'ontheroad'
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
