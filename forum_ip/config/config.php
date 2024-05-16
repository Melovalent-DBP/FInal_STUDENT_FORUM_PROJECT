<?php

try {
    // host  //DBP_NOTES It means that the host is localhost
    define("HOST", "localhost");

    // dbname
    define("DBNAME", "cuetforum");

    // user
    define("USER", "DBP");

    // password
    define("PASS", "145763");

    $conn = new PDO("mysql:host=" . HOST . ";dbname=" . DBNAME . "", USER, PASS);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $Exception) {
    echo $Exception->getMessage();
}