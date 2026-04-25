{
  "apps" [
    {
      "name": "cityhomes-backend",
      "script": "dist/main.js",
      "instances": 1,
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "500M",
      "env": {
        "NODE_ENV": "development",
        "PORT": 3001
      },
      "env_production": {
        "NODE_ENV": "production",
        "PORT": 3001
      },
      "error_file": "./logs/error.log",
      "out_file": "./logs/out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss",
      "merge_logs": true,
      "restart_delay": 4000,
      "max_restarts": 10
    }
  ]
}
