# .platform/hooks/predeploy/02_install_rust.sh
#!/bin/bash
echo "Installing Rust..." > /var/log/rust_install.log
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env
echo "PATH=$PATH" >> /var/log/rust_install.log
echo "Rust version:" >> /var/log/rust_install.log
rustc --version >> /var/log/rust_install.log 2>&1