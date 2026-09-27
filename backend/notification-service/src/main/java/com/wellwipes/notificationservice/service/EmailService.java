package com.wellwipes.notificationservice.service;

import com.wellwipes.common.event.OrderPlacedEvent;
import com.wellwipes.common.event.PaymentFailedEvent;
import com.wellwipes.common.event.PaymentSucceededEvent;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${wellwipes.notification.from-email}")
    private String fromEmail;

    @Value("${wellwipes.notification.from-name}")
    private String fromName;

    @Value("${wellwipes.notification.admin-email}")
    private String adminEmail;

    // ───────────────────────────── ORDER PLACED ─────────────────────────────

    @Async
    public void sendOrderConfirmation(OrderPlacedEvent event) {
        String subject = "Your Well-Wipes order is confirmed — #" + shortId(event.orderId());
        String body = buildOrderConfirmationBody(event);

        // Send to the real customer
        if (event.userEmail() != null && !event.userEmail().isBlank()) {
            sendHtml(event.userEmail(), subject, body);
            log.info("Order confirmation sent to {} for order {}", event.userEmail(), event.orderId());
        } else {
            log.warn("No customer email on OrderPlacedEvent for order {}", event.orderId());
        }

        // Also notify admin
        sendHtml(adminEmail, "[ADMIN] New order #" + shortId(event.orderId()), buildAdminOrderBody(event));
    }

    // ───────────────────────────── PAYMENT SUCCESS ─────────────────────────────

    @Async
    public void sendPaymentSuccess(PaymentSucceededEvent event) {
        String subject = "Payment received — order #" + shortId(event.orderId());
        String body = buildSimpleBody(
                "Payment received",
                "We've received your payment of <strong>" +
                        formatCents(event.amountCents(), event.currency()) +
                        "</strong> for order <strong>#" + shortId(event.orderId()) + "</strong>.",
                "Your order is now being prepared. We'll email you again as soon as it ships."
        );

        if (event.userEmail() != null && !event.userEmail().isBlank()) {
            sendHtml(event.userEmail(), subject, body);
        }
        sendHtml(adminEmail, "[ADMIN] Payment succeeded #" + shortId(event.orderId()), body);
    }

    // ───────────────────────────── PAYMENT FAILED ─────────────────────────────

    @Async
    public void sendPaymentFailed(PaymentFailedEvent event) {
        String subject = "Payment issue — order #" + shortId(event.orderId());
        String body = buildSimpleBody(
                "Payment could not be completed",
                "Reason: " + (event.failureReason() == null ? "unknown" : event.failureReason()),
                "You can try again by visiting your orders page. Nothing has been charged."
        );

        if (event.userEmail() != null && !event.userEmail().isBlank()) {
            sendHtml(event.userEmail(), subject, body);
        }
        sendHtml(adminEmail, "[ADMIN] Payment failed #" + shortId(event.orderId()), body);
    }

    // ───────────────────────────── HTML TEMPLATES ─────────────────────────────

    private String buildOrderConfirmationBody(OrderPlacedEvent event) {
        String greeting = event.userFullName() != null
                ? event.userFullName().split(" ")[0]
                : "there";

        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"font-family:Inter,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#0f172a;\">");
        sb.append("<div style=\"text-align:center;margin-bottom:32px;\">");
        sb.append("<div style=\"display:inline-block;width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#0284c7,#0891b2);color:white;line-height:56px;font-size:22px;font-weight:700;\">WW</div>");
        sb.append("<p style=\"margin:16px 0 0;font-size:12px;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;\">Well-Wipes</p>");
        sb.append("</div>");

        sb.append("<h1 style=\"font-size:28px;font-weight:800;letter-spacing:-0.5px;margin:0 0 12px;\">Thank you, ").append(escape(greeting)).append(".</h1>");
        sb.append("<p style=\"font-size:16px;line-height:1.6;color:#475569;margin:0 0 8px;\">Your order <strong>#").append(shortId(event.orderId())).append("</strong> is confirmed.</p>");
        sb.append("<p style=\"font-size:16px;line-height:1.6;color:#475569;margin:0 0 32px;\">We'll send you a note the moment it ships.</p>");

        sb.append("<div style=\"border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:24px;\">");
        sb.append("<table style=\"width:100%;border-collapse:collapse;font-size:14px;\">");
        sb.append("<thead><tr style=\"background:#f8fafc;\">");
        sb.append("<th style=\"text-align:left;padding:14px 16px;color:#64748b;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;\">Item</th>");
        sb.append("<th style=\"text-align:center;padding:14px 16px;color:#64748b;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:60px;\">Qty</th>");
        sb.append("<th style=\"text-align:right;padding:14px 16px;color:#64748b;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;\">Price</th>");
        sb.append("</tr></thead><tbody>");

        for (OrderPlacedEvent.Item item : event.items()) {
            sb.append("<tr style=\"border-top:1px solid #f1f5f9;\">");
            sb.append("<td style=\"padding:14px 16px;\">");
            sb.append("<div style=\"font-weight:600;color:#0f172a;\">").append(escape(item.name())).append("</div>");
            sb.append("<div style=\"font-size:12px;color:#94a3b8;margin-top:2px;\">SKU ").append(escape(item.sku())).append("</div>");
            sb.append("</td>");
            sb.append("<td style=\"padding:14px 16px;text-align:center;color:#475569;\">").append(item.quantity()).append("</td>");
            sb.append("<td style=\"padding:14px 16px;text-align:right;color:#0f172a;font-weight:600;\">")
              .append(formatCents(item.unitPriceCents() * item.quantity(), event.currency())).append("</td>");
            sb.append("</tr>");
        }

        sb.append("</tbody></table>");
        sb.append("<div style=\"border-top:1px solid #e2e8f0;padding:16px;background:#f8fafc;display:flex;justify-content:space-between;\">");
        sb.append("<span style=\"font-weight:600;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;\">Total</span>");
        sb.append("<span style=\"font-weight:800;color:#0f172a;font-size:20px;\">").append(formatCents(event.totalCents(), event.currency())).append("</span>");
        sb.append("</div></div>");

        sb.append("<div style=\"background:#f0fdfa;border-radius:12px;padding:16px;margin-bottom:24px;\">");
        sb.append("<p style=\"margin:0;font-size:14px;color:#0f766e;line-height:1.6;\">");
        sb.append("<strong>Ships in 24 hours.</strong> Delivered in 2–3 days. Free over ₹499.");
        sb.append("</p></div>");

        sb.append("<p style=\"font-size:14px;color:#94a3b8;text-align:center;margin:32px 0 0;\">");
        sb.append("Questions? Just reply to this email — we read every one.</p>");
        sb.append("<p style=\"font-size:12px;color:#cbd5e1;text-align:center;margin:8px 0 0;\">");
        sb.append("© Well-Wipes · Coimbatore, India</p>");
        sb.append("</div>");

        return sb.toString();
    }

    private String buildAdminOrderBody(OrderPlacedEvent event) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"font-family:Inter,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#0f172a;\">");
        sb.append("<h2 style=\"margin:0 0 8px;\">New order #").append(shortId(event.orderId())).append("</h2>");
        sb.append("<p style=\"color:#475569;margin:0 0 24px;\">");
        if (event.userFullName() != null) sb.append(escape(event.userFullName())).append(" · ");
        if (event.userEmail() != null) sb.append(escape(event.userEmail()));
        sb.append("</p>");

        sb.append("<ul style=\"padding-left:20px;color:#475569;line-height:1.8;\">");
        for (OrderPlacedEvent.Item item : event.items()) {
            sb.append("<li>").append(escape(item.name()))
              .append(" × ").append(item.quantity())
              .append(" — ").append(formatCents(item.unitPriceCents() * item.quantity(), event.currency()))
              .append("</li>");
        }
        sb.append("</ul>");
        sb.append("<p style=\"font-size:18px;font-weight:700;margin-top:24px;\">Total: ")
          .append(formatCents(event.totalCents(), event.currency())).append("</p>");
        sb.append("</div>");
        return sb.toString();
    }

    private String buildSimpleBody(String title, String line1, String line2) {
        return "<div style=\"font-family:Inter,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#0f172a;\">" +
                "<div style=\"text-align:center;margin-bottom:32px;\">" +
                "<div style=\"display:inline-block;width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#0284c7,#0891b2);color:white;line-height:56px;font-size:22px;font-weight:700;\">WW</div>" +
                "</div>" +
                "<h1 style=\"font-size:24px;font-weight:800;margin:0 0 16px;\">" + title + "</h1>" +
                "<p style=\"font-size:15px;line-height:1.6;color:#475569;margin:0 0 12px;\">" + line1 + "</p>" +
                "<p style=\"font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px;\">" + line2 + "</p>" +
                "<p style=\"font-size:12px;color:#cbd5e1;text-align:center;margin:32px 0 0;\">© Well-Wipes · Coimbatore, India</p>" +
                "</div>";
    }

    private void sendHtml(String to, String subject, String htmlBody) {
        if (to == null || to.isBlank()) return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception ex) {
            log.error("Email send failed to {}: {}", to, ex.getMessage(), ex);
        }
    }

    private String shortId(java.util.UUID id) {
        return id.toString().substring(0, 8).toUpperCase();
    }

    private String formatCents(long cents, String currency) {
        double rupees = cents / 100.0;
        return currency + " " + String.format("%,.2f", rupees);
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
