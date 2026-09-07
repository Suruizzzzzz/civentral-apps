<?php
 = new PDO('mysql:host=127.0.0.1;dbname=education', 'root', '');
 = ->query('SELECT * FROM partner_schools');
print_r(->fetchAll(PDO::FETCH_ASSOC));
