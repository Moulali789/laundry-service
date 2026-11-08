const API = "api.php";
const $ = (id) => document.getElementById(id);
const today = new Date().toISOString().slice(0,10);
document.querySelectorAll('input[type="date"]').forEach(x => x.value = today);
function message(text, error=false){$("message").textContent=text;$("message").style.color=error?"#b42318":"#087e8b";}
async function request(action, options={}) {
  const response=await fetch(`${API}?action=${action}`,options);
  const data=await response.json();
  if(!response.ok || data.error) throw new Error(data.error || "Request failed");
  return data;
}
function body(data){return {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}}
async function load(){
 try{
  const [customers,services,orders,payments]=await Promise.all(["customers","services","orders","payments"].map(a=>request(a)));
  $("customerCount").textContent=customers.length;$("orderCount").textContent=orders.length;
  $("completedCount").textContent=orders.filter(o=>o.status==="Completed").length;
  $("paymentTotal").textContent="₹"+payments.filter(p=>p.status==="Paid").reduce((s,p)=>s+Number(p.amount),0).toFixed(2);
  $("customersTable").innerHTML=customers.map(c=>`<tr><td>${c.customer_id}</td><td>${esc(c.name)}</td><td>${esc(c.phone)}</td><td>${esc(c.email||"")}</td><td>${esc(c.address||"")}</td></tr>`).join("");
  $("customerSelect").innerHTML='<option value="">Select customer</option>'+customers.map(c=>`<option value="${c.customer_id}">${esc(c.name)}</option>`).join("");
  $("serviceSelect").innerHTML='<option value="">Select service</option>'+services.map(s=>`<option value="${s.service_id}" data-price="${s.price_per_kg}">${esc(s.service_name)} (₹${s.price_per_kg}/kg)</option>`).join("");
  $("serviceList").innerHTML=services.map(s=>`<div class="service"><b>${esc(s.service_name)}</b>₹${Number(s.price_per_kg).toFixed(2)} / kg<p>${esc(s.description||"")}</p></div>`).join("");
  $("ordersTable").innerHTML=orders.map(o=>`<tr><td>${o.order_id}</td><td>${esc(o.customer_name)}</td><td>${esc(o.service_name)}</td><td>${o.clothes_weight} kg</td><td>${o.order_date}</td><td>${o.delivery_date}</td><td>${esc(o.status)}</td><td><select class="small-select" onchange="updateStatus(${o.order_id},this.value)"><option ${o.status==="Pending"?"selected":""}>Pending</option><option ${o.status==="Processing"?"selected":""}>Processing</option><option ${o.status==="Ready"?"selected":""}>Ready</option><option ${o.status==="Completed"?"selected":""}>Completed</option></select></td></tr>`).join("");
  $("paymentOrderSelect").innerHTML='<option value="">Select order</option>'+orders.map(o=>`<option value="${o.order_id}">#${o.order_id} - ${esc(o.customer_name)}</option>`).join("");
  $("paymentsTable").innerHTML=payments.map(p=>`<tr><td>${p.payment_id}</td><td>${p.order_id}</td><td>₹${Number(p.amount).toFixed(2)}</td><td>${p.payment_date}</td><td>${esc(p.payment_method)}</td><td>${esc(p.status)}</td></tr>`).join("");
 }catch(e){message(e.message+" — Start PHP server and check MySQL setup.",true)}
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("customerForm").addEventListener("submit",async e=>{e.preventDefault();try{await request("add_customer",{...body(Object.fromEntries(new FormData(e.target)))});e.target.reset();message("Customer added.");load()}catch(x){message(x.message,true)}});
$("orderForm").addEventListener("submit",async e=>{e.preventDefault();try{await request("add_order",body(Object.fromEntries(new FormData(e.target))));e.target.reset();message("Order created.");load()}catch(x){message(x.message,true)}});
$("paymentForm").addEventListener("submit",async e=>{e.preventDefault();try{await request("add_payment",body(Object.fromEntries(new FormData(e.target))));e.target.reset();message("Payment saved.");load()}catch(x){message(x.message,true)}});
async function updateStatus(id,status){try{await request("update_status",body({order_id:id,status}));message("Order status updated.");load()}catch(e){message(e.message,true)}}
load();