require 'yaml'

module SlackLocationStatus
  class Config
    def self.yaml_file
      File.join(File.dirname(__FILE__), '..', '..', 'config', 'slack.yml')
    end

    def self.config
      @config ||= YAML.load_file(yaml_file)
    end
  end
end
