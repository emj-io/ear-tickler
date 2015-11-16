<?php
  if (!defined('ALLOW_ANONYMOUS_USERS'))       define('ALLOW_ANONYMOUS_USERS', true);
  if (!defined('ALLOW_CROSS_DOMAIN_REQUESTS')) define('ALLOW_CROSS_DOMAIN_REQUESTS', false);

  if (!defined('PATH_TO_DATABASE_FILE'))       define('PATH_TO_DATABASE_FILE', '../../data/database.db');
  if (!defined('PATH_TO_DEFAULT_TRACKS_JSON')) define('PATH_TO_DEFAULT_TRACKS_JSON', '../data/default_tracks.json');

  if (!defined('USER_ID_COOKIE'))              define('USER_ID_COOKIE', 'user_id');
?>