Vagrant.configure("2") do |config|
  config.vm.box = "debian/bullseye64"

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "3072"
    vb.cpus = 2
  end

  GO_VERSION = "1.17"
  config.vm.provision "shell" do |s|
    s.inline = <<~SHELL
      sudo apt update -q
      sudo apt install -qy build-essential
      wget -q https://golang.org/dl/go#{GO_VERSION}.linux-amd64.tar.gz -O go#{GO_VERSION}.linux-amd64.tar.gz
      sudo tar -zxf go#{GO_VERSION}.linux-amd64.tar.gz -C /usr/local/
      echo "export PATH=/usr/local/go/bin:${PATH}" | sudo tee /etc/profile.d/go.sh
    SHELL
  end
end
