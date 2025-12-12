import { createServerClient } from "@/lib/supabase/server"
import { TriggerNotificationClient } from "@/components/trigger-notification-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

const mockUsers = [
  {
    id: "1",
    email: "john.martinez@energy.com",
    name: "John Martinez",
    user_type_id: "1",
    user_type: { id: "1", name: "Residential" },
    user_tags: [{ tag: { id: "1", name: "High Usage" } }, { tag: { id: "2", name: "Smart Meter" } }],
  },
  {
    id: "2",
    email: "sarah.chen@energy.com",
    name: "Sarah Chen",
    user_type_id: "2",
    user_type: { id: "2", name: "Commercial" },
    user_tags: [{ tag: { id: "3", name: "Premium" } }],
  },
  {
    id: "3",
    email: "michael.thompson@energy.com",
    name: "Michael Thompson",
    user_type_id: "1",
    user_type: { id: "1", name: "Residential" },
    user_tags: [{ tag: { id: "4", name: "Solar Panel" } }],
  },
  {
    id: "4",
    email: "emily.rodriguez@energy.com",
    name: "Emily Rodriguez",
    user_type_id: "3",
    user_type: { id: "3", name: "Industrial" },
    user_tags: [{ tag: { id: "3", name: "Premium" } }, { tag: { id: "5", name: "Peak Hours" } }],
  },
  {
    id: "5",
    email: "david.kim@energy.com",
    name: "David Kim",
    user_type_id: "1",
    user_type: { id: "1", name: "Residential" },
    user_tags: [{ tag: { id: "2", name: "Smart Meter" } }],
  },
  {
    id: "6",
    email: "lisa.anderson@energy.com",
    name: "Lisa Anderson",
    user_type_id: "2",
    user_type: { id: "2", name: "Commercial" },
    user_tags: [{ tag: { id: "1", name: "High Usage" } }, { tag: { id: "3", name: "Premium" } }],
  },
  {
    id: "7",
    email: "james.wilson@energy.com",
    name: "James Wilson",
    user_type_id: "1",
    user_type: { id: "1", name: "Residential" },
    user_tags: [],
  },
  {
    id: "8",
    email: "anna.patel@energy.com",
    name: "Anna Patel",
    user_type_id: "3",
    user_type: { id: "3", name: "Industrial" },
    user_tags: [
      { tag: { id: "3", name: "Premium" } },
      { tag: { id: "4", name: "Solar Panel" } },
      { tag: { id: "5", name: "Peak Hours" } },
    ],
  },
  {
    id: "9",
    email: "robert.brown@energy.com",
    name: "Robert Brown",
    user_type_id: "2",
    user_type: { id: "2", name: "Commercial" },
    user_tags: [{ tag: { id: "1", name: "High Usage" } }],
  },
  {
    id: "10",
    email: "jennifer.garcia@energy.com",
    name: "Jennifer Garcia",
    user_type_id: "1",
    user_type: { id: "1", name: "Residential" },
    user_tags: [{ tag: { id: "2", name: "Smart Meter" } }, { tag: { id: "4", name: "Solar Panel" } }],
  },
]

const mockSchemas = {
  high_usage_alert: {
    id: "high_usage_alert",
    level1: "Energy Usage",
    level2: "Alerts",
    level3: "High Usage Alert",
    description: "Alert sent when customer's energy consumption increases significantly",
    email: {
      placeholders: ["customer_name", "consumption_percentage", "recommendation"],
      subject: "High Energy Usage Alert - Action Required",
      body: "Dear {{customer_name}},\n\nWe noticed your energy consumption has increased by {{consumption_percentage}}. To improve efficiency and reduce costs, we recommend: {{recommendation}}.\n\nBest regards,\nEnergy Portal Team",
    },
    in_app: {
      placeholders: ["customer_name", "consumption_percentage", "recommendation"],
      title: "High Usage Alert",
      message: "Hi {{customer_name}}, your consumption is up {{consumption_percentage}}. {{recommendation}}",
    },
    push: {
      placeholders: ["consumption_percentage"],
      title: "Energy Alert",
      message: "Usage increased by {{consumption_percentage}}",
    },
    sms: {
      placeholders: ["consumption_percentage"],
      message: "Energy Alert: Usage up {{consumption_percentage}}. Check your portal.",
    },
  },
  invoice_generated: {
    id: "invoice_generated",
    level1: "Billing",
    level2: "Invoices",
    level3: "Invoice Generated",
    description: "Notification when a new monthly invoice is available",
    email: {
      placeholders: ["customer_name", "invoice_amount", "due_date"],
      subject: "Your Energy Bill is Ready",
      body: "Dear {{customer_name}},\n\nYour monthly energy bill of {{invoice_amount}} is now available. Payment is due by {{due_date}}.\n\nView and pay your bill in the customer portal.\n\nThank you for your business.",
    },
    in_app: {
      placeholders: ["invoice_amount", "due_date"],
      title: "New Invoice Available",
      message: "Your bill of {{invoice_amount}} is ready. Due date: {{due_date}}",
    },
    push: {
      placeholders: ["invoice_amount"],
      title: "New Bill",
      message: "Your energy bill of {{invoice_amount}} is ready",
    },
    sms: {
      placeholders: ["invoice_amount", "due_date"],
      message: "New bill: {{invoice_amount}}. Due: {{due_date}}. Pay in portal.",
    },
  },
  payment_received: {
    id: "payment_received",
    level1: "Billing",
    level2: "Payments",
    level3: "Payment Received",
    description: "Confirmation notification when payment is successfully processed",
    email: {
      placeholders: ["customer_name", "payment_amount", "confirmation_number"],
      subject: "Payment Received - Thank You",
      body: "Dear {{customer_name}},\n\nWe've received your payment of {{payment_amount}}. Your confirmation number is {{confirmation_number}}.\n\nThank you for your prompt payment!",
    },
    in_app: {
      placeholders: ["payment_amount", "confirmation_number"],
      title: "Payment Confirmed",
      message: "Payment of {{payment_amount}} received. Confirmation: {{confirmation_number}}",
    },
    push: {
      placeholders: ["payment_amount"],
      title: "Payment Successful",
      message: "Payment of {{payment_amount}} confirmed",
    },
    sms: {
      placeholders: ["payment_amount", "confirmation_number"],
      message: "Payment received: {{payment_amount}}. Ref: {{confirmation_number}}",
    },
  },
  outage_detected: {
    id: "outage_detected",
    level1: "Service",
    level2: "Outages",
    level3: "Outage Detected",
    description: "Alert when power outage is detected in customer's area",
    email: {
      placeholders: ["customer_name", "outage_location", "estimated_restoration"],
      subject: "Power Outage Alert - We're Working On It",
      body: "Dear {{customer_name}},\n\nWe've detected a power outage in {{outage_location}}. Our team is working to restore service by {{estimated_restoration}}.\n\nWe apologize for the inconvenience.",
    },
    in_app: {
      placeholders: ["outage_location", "estimated_restoration"],
      title: "Power Outage",
      message: "Outage in {{outage_location}}. Estimated restoration: {{estimated_restoration}}",
    },
    push: {
      placeholders: ["estimated_restoration"],
      title: "Power Outage Alert",
      message: "Service interruption. Est. restoration: {{estimated_restoration}}",
    },
    sms: {
      placeholders: ["estimated_restoration"],
      message: "Power outage detected. Est. restoration: {{estimated_restoration}}",
    },
  },
}

export default async function TriggerNotificationPage() {
  const supabase = await createServerClient()

  // Fetch notification schemas (events)
  const { data: schemas, error: schemasError } = await supabase
    .from("notification_schemas")
    .select("*")
    .order("level1", { ascending: true })

  if (schemasError) {
    if (schemasError.message?.includes("does not exist")) {
      redirect("/setup")
    }
    redirect("/error")
  }

  // Fetch users with their types and tags
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select(
      `
      *,
      user_type:user_types(*),
      user_tags(tag:tags(*))
    `,
    )
    .order("name", { ascending: true })

  const displayUsers = users && users.length > 0 ? users : mockUsers

  return <TriggerNotificationClient schemas={mockSchemas} users={displayUsers} />
}
