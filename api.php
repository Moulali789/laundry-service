<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$host = 'localhost'; $dbname = 'laundry_moulali'; $username = 'root'; $password = '';
try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);
} catch (PDOException $e) { http_response_code(500); echo json_encode(['error'=>'Database connection failed. Check api.php credentials and import database.sql.']); exit; }

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];
function done($data, $code=200) { http_response_code($code); echo json_encode($data); exit; }
try {
 switch ($action) {
  case 'customers': done($pdo->query("SELECT * FROM customers ORDER BY customer_id DESC")->fetchAll());
  case 'services': done($pdo->query("SELECT * FROM services ORDER BY service_id")->fetchAll());
  case 'orders':
   done($pdo->query("SELECT o.*, c.name AS customer_name, s.service_name FROM laundry_orders o JOIN customers c ON c.customer_id=o.customer_id JOIN services s ON s.service_id=o.service_id ORDER BY o.order_id DESC")->fetchAll());
  case 'payments': done($pdo->query("SELECT * FROM payments ORDER BY payment_id DESC")->fetchAll());
  case 'add_customer':
   if (empty($input['name']) || empty($input['phone'])) done(['error'=>'Name and phone are required'],400);
   $q=$pdo->prepare("INSERT INTO customers(name,phone,email,address) VALUES(?,?,?,?)");
   $q->execute([$input['name'],$input['phone'],$input['email']??null,$input['address']??null]); done(['success'=>true],201);
  case 'add_order':
   foreach(['customer_id','service_id','clothes_weight','order_date','delivery_date'] as $k) if(empty($input[$k])) done(['error'=>"Missing field: $k"],400);
   $q=$pdo->prepare("INSERT INTO laundry_orders(customer_id,service_id,clothes_weight,order_date,delivery_date,status) VALUES(?,?,?,?,?,'Pending')");
   $q->execute([$input['customer_id'],$input['service_id'],$input['clothes_weight'],$input['order_date'],$input['delivery_date']]); done(['success'=>true],201);
  case 'update_status':
   $allowed=['Pending','Processing','Ready','Completed'];
   if(!in_array($input['status']??'', $allowed,true)) done(['error'=>'Invalid status'],400);
   $q=$pdo->prepare("UPDATE laundry_orders SET status=? WHERE order_id=?");$q->execute([$input['status'],$input['order_id']??0]);done(['success'=>true]);
  case 'add_payment':
   foreach(['order_id','amount','payment_date','payment_method','status'] as $k) if(!isset($input[$k]) || $input[$k]==='') done(['error'=>"Missing field: $k"],400);
   $q=$pdo->prepare("INSERT INTO payments(order_id,amount,payment_date,payment_method,status) VALUES(?,?,?,?,?)");
   $q->execute([$input['order_id'],$input['amount'],$input['payment_date'],$input['payment_method'],$input['status']]);done(['success'=>true],201);
  default: done(['error'=>'Unknown action'],404);
 }
} catch (PDOException $e) { done(['error'=>'Database operation failed. Check the submitted data and table setup.'],400); }
?>