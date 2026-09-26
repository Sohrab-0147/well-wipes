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

    @Async
    public void sendOrderConfirmation(OrderPlacedEvent event) {
        String subject = "Well-Wipes — Order confirmed (" + shortId(event.orderId()) + ")";
        String body = buildOrderConfirmationBody(event);
        sendHtml(adminEmail, "[ADMIN] New order " + shortId(event.orderId()), body);
        log.info("Order confirmation emails queued for order {}", event.orderId());
    }

    @Async
    public void sendPaymentSuccess(PaymentSucceededEvent event) {
        String subject = "Well-Wipes — Payment received (" + shortId(event.orderId()) + ")";
        String body = "<h2>Payment received</h2>" +
                "<p>We've received your payment of <strong>" +
                formatCents(event.amountCents(), event.currency()) +
                "</strong>.</p><p>Order ID: " + event.orderId() + "</p>";
        sendHtml(adminEmail, "[ADMIN] Payment succeeded " + shortId(event.orderId()), body);
        log.info("Payment success email queued for order {}", event.orderId());
    }

    @Async
    public void sendPaymentFailed(PaymentFailedEvent event) {
        String subject = "Well-Wipes — Payment failed (" + shortId(event.orderId()) + ")";
        String body = "<h2>Payment failed</h2>" +
                "<p>Reason: " + (event.failureReason() == null ? "unknown" : event.failureReason()) + "</p>" +
                "<p>Order ID: " + event.orderId() + "</p>";
        sendHtml(adminEmail, "[ADMIN] Payment failed " + shortId(event.orderId()), body);
        log.warn("Payment failure email queued for order {}", event.orderId());
    }

    private void sendHtml(String to, String subject, String htmlBody) {
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

    private String buildOrderConfirmationBody(OrderPlacedEvent event) {
        StringBuilder sb = new StringBuilder();
        sb.append("<h2>Thank you for your order!</h2>");
        sb.append("<p><strong>Order ID:</strong> ").append(event.orderId()).append("</p>");
        sb.append("<table cellpadding=\"6\" style=\"border-collapse:collapse\">");
        sb.append("<tr style=\"background:#f0f0f0\"><th align=\"left\">Item</th>")
          .append("<th align=\"right\">Qty</th><th align=\"right\">Price</th></tr>");
        for (OrderPlacedEvent.Item item : event.items()) {
            sb.append("<tr><td>").append(escape(item.name())).append("</td><td align=\"right\">")
              .append(item.quantity()).append("</td><td align=\"right\">")
              .append(formatCents(item.unitPriceCents(), event.currency()))
              .append("</td></tr>");
        }
        sb.append("</table>");
        sb.append("<p style=\"font-size:1.1em\"><strong>Total: ")
          .append(formatCents(event.totalCents(), event.currency()))
          .append("</strong></p>");
        sb.append("<p>We'll notify you again once your payment is confirmed.</p>");
        return sb.toString();
    }

    private String shortId(java.util.UUID id) {
        return id.toString().substring(0, 8);
    }

    private String formatCents(long cents, String currency) {
        return currency + " " + String.format("%.2f", cents / 100.0);
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
