<?php
    header('Content-Type: text/plain');

    $save_directory = $_POST['directory_path'];
    $file_name = $_POST['file_name'];

    if (!is_dir($save_directory)) {
        mkdir($save_directory, 0777, true);
    }

    function file_path_based_on_file_exist($count, $directory, $name) {
        $name_array = explode('.', $name);
        $numbered_name = $name_array[0] . '_' . strval($count) . '.' . $name_array[1];
        $path = $directory . '/' . $numbered_name;
        if (!file_exists($path)) {
            return $path;
        } else {
            $count += 1;
            return file_path_based_on_file_exist($count, $directory, $name);
        }
    }

    $count = 0;
    $file_path = file_path_based_on_file_exist($count, $save_directory, $file_name);

    $dataFile = fopen($file_path, 'w');
    fwrite($dataFile, $_POST['data']);
    fclose($dataFile);
?>
