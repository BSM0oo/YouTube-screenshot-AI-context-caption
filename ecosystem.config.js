module.exports = {
  apps : [{
    name: "youtube-notes-backend",
    script: "python",
    args: "main.py",
    env: {
      PORT: "8000",
      NODE_ENV: "production"
    },
    watch: false,
    max_memory_restart: '1G',
    error_file: "logs/error.log",
    out_file: "logs/out.log",
    log_file: "logs/combined.log",
    time: true
  }]
}
