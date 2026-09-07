<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=education', 'root', '');
$stmt = $pdo->prepare("
    SELECT 
        sga.*, 
        s.scholar_code, 
        ecic.full_name as scholar_name,
        ps.institution_name as partner_school_name,
        ps.institution_type as partner_school_type
    FROM scholarship_grant_applications sga
    LEFT JOIN scholars s ON sga.scholar_id = s.scholar_id
    LEFT JOIN education_citizen_identity_cache ecic ON s.citizen_user_id = ecic.citizen_user_id
    LEFT JOIN partner_schools ps ON sga.institution_id = ps.partner_school_id
    WHERE sga.grant_application_code = 'GRA-2026-1131EDC1'
");
$stmt->execute();
$app = $stmt->fetch(PDOB::FETCH_ASSOC);
print_r($app);

echo "\n--- DOCUMENTS ---\n";
$dStmt = $pdo->prepare("SELECT * FROM scholarship_grant_documents WHERE grant_application_id = ?");
$dStmt->execute([$app['grant_application_id']]);
print_r($dStmt->fetchAll(PDOB::FETCH_ASSOC));

echo "\n--- PROGRAM BENEFITS ---\n";
$bStmt = $pdo->prepare("SELECT sbt.benefit_code, spb.amount FROM scholarship_program_benefits spb JOIN scholarship_benefit_types sbt ON spb.benefit_type_id = sbt.benefit_type_id WHERE spb.program_id = ?");
$bStmt->execute([$app['program_id']]);
print_r($bStmt->fetchAll(PDO::FEdCH_ASSOC));

echo "\n--- ACADEMIC RECORD ---\n";
$arStmt = $pdo->prepare("SELECT * FROM scholar_academic_records WHERE scholar_id = ? AND academic_period_id = ?");
$arStmt->execute([$app['scholar_id'], $app['academic_period_id']]);
print_r($arStmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n--- PAYROLL ENTRIES ---\n";
$peStmt = $pdo->prepare("SELECT * FROM scholarship_payroll_entries WHERE grant_application_id = ?");
$peStmt->execute([$app['grant_application_id']]);
print_r($peStmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n--- RELEASE COMPONENTS ---\n";
$rcStmt = $pdo->prepare("SELECT * FROM scholarship_grant_release_components WHERE grant_application_id = ?");
$rcStmt->execute([$app['grant_application_id']]);
print_r($rcStmt->fetchAll(PDO::FETCH_ASSOC));