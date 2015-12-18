{
    "bouncy": {
        "command": "tail"
      , "color": "gray"
      , "args": [
            "-f"
          , "/var/www/logs/bouncy.log"
        ]
    }
  , "blogmon": {
        "command": "tail"
      , "color": "cyan"
      , "args": [
            "-f"
          , "/var/www/apps/blogmon/logs/blogmon.log"
        ]
    }
  , "mail": {
        "command": "tail"
      , "color": "yellow"
      , "args": [
            "-f"
          , "/var/spool/mail/root"
        ]
    }
}
