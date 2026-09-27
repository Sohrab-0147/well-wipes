package com.wellwipes.orderservice.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.wellwipes.orderservice.domain.Order;
import com.wellwipes.orderservice.domain.OrderItem;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class InvoiceService {

    private static final Color SKY = new Color(2, 132, 199);
    private static final Color INK = new Color(15, 23, 42);
    private static final Color SOFT = new Color(71, 85, 105);
    private static final Color MUTE = new Color(148, 163, 184);
    private static final Color LINE = new Color(226, 232, 240);
    private static final Color CREAM = new Color(248, 250, 252);

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy").withZone(ZoneId.of("Asia/Kolkata"));

    public byte[] generate(Order order) {
        try {
            Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(doc, out);
            doc.open();

            addHeader(doc, order);
            addAddresses(doc, order);
            addItemsTable(doc, order);
            addTotals(doc, order);
            addFooter(doc);

            doc.close();
            return out.toByteArray();
        } catch (DocumentException ex) {
            throw new RuntimeException("Failed to generate invoice", ex);
        }
    }

    private void addHeader(Document doc, Order order) throws DocumentException {
        PdfPTable header = new PdfPTable(2);
        header.setWidthPercentage(100);
        header.setWidths(new float[]{2, 1});

        PdfPCell left = new PdfPCell();
        left.setBorder(Rectangle.NO_BORDER);
        left.setPadding(0);

        Font brand = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, SKY);
        Font tagline = FontFactory.getFont(FontFactory.HELVETICA, 9, MUTE);
        Paragraph p1 = new Paragraph("Well-Wipes", brand);
        p1.setSpacingAfter(2);
        left.addElement(p1);
        left.addElement(new Paragraph("Everyday softness, made the slow way.", tagline));
        left.addElement(new Paragraph("Coimbatore, Tamil Nadu, India", tagline));
        header.addCell(left);

        PdfPCell right = new PdfPCell();
        right.setBorder(Rectangle.NO_BORDER);
        right.setHorizontalAlignment(Element.ALIGN_RIGHT);
        right.setPadding(0);

        Font invLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, INK);
        Font meta = FontFactory.getFont(FontFactory.HELVETICA, 9, SOFT);
        Paragraph p2 = new Paragraph("INVOICE", invLabel);
        p2.setAlignment(Element.ALIGN_RIGHT);
        p2.setSpacingAfter(6);
        right.addElement(p2);

        Paragraph idLine = new Paragraph("#" + shortId(order.getId()), meta);
        idLine.setAlignment(Element.ALIGN_RIGHT);
        right.addElement(idLine);

        Paragraph dateLine = new Paragraph(
                "Issued " + DATE_FMT.format(order.getCreatedAt()), meta);
        dateLine.setAlignment(Element.ALIGN_RIGHT);
        right.addElement(dateLine);

        header.addCell(right);
        doc.add(header);

        Paragraph divider = new Paragraph(" ");
        divider.setSpacingBefore(14);
        doc.add(divider);

        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setBorder(Rectangle.BOTTOM);
        lineCell.setBorderColor(LINE);
        lineCell.setBorderWidth(1f);
        lineCell.setFixedHeight(1f);
        line.addCell(lineCell);
        doc.add(line);
    }

    private void addAddresses(Document doc, Order order) throws DocumentException {
        Map<String, Object> addr = order.getShippingAddress();
        String name = str(addr.get("fullName"));
        String phone = str(addr.get("phone"));
        String line1 = str(addr.get("line1"));
        String line2 = str(addr.get("line2"));
        String city = str(addr.get("city"));
        String state = str(addr.get("state"));
        String pincode = str(addr.get("pincode"));
        String country = str(addr.get("country"));

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1, 1});
        table.setSpacingBefore(24);

        Font label = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, MUTE);
        Font bold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, INK);
        Font normal = FontFactory.getFont(FontFactory.HELVETICA, 10, SOFT);

        PdfPCell shipTo = new PdfPCell();
        shipTo.setBorder(Rectangle.NO_BORDER);
        shipTo.setPadding(0);
        Paragraph lbl = new Paragraph("SHIP TO", label);
        lbl.setSpacingAfter(6);
        shipTo.addElement(lbl);
        if (!name.isBlank()) shipTo.addElement(new Paragraph(name, bold));
        if (!phone.isBlank()) shipTo.addElement(new Paragraph(phone, normal));
        if (!line1.isBlank()) shipTo.addElement(new Paragraph(line1, normal));
        if (!line2.isBlank()) shipTo.addElement(new Paragraph(line2, normal));
        StringBuilder cityLine = new StringBuilder();
        for (String part : new String[]{city, state, pincode}) {
            if (part != null && !part.isBlank()) {
                if (cityLine.length() > 0) cityLine.append(", ");
                cityLine.append(part);
            }
        }
        if (cityLine.length() > 0) shipTo.addElement(new Paragraph(cityLine.toString(), normal));
        if (!country.isBlank()) shipTo.addElement(new Paragraph(country, normal));
        table.addCell(shipTo);

        PdfPCell payment = new PdfPCell();
        payment.setBorder(Rectangle.NO_BORDER);
        payment.setPadding(0);
        Paragraph payLbl = new Paragraph("PAYMENT", label);
        payLbl.setSpacingAfter(6);
        payment.addElement(payLbl);
        payment.addElement(new Paragraph("Status: " + order.getStatus().name(), bold));
        if (order.getStripeSessionId() != null) {
            String session = order.getStripeSessionId();
            String shortSession = session.length() > 20 ? session.substring(0, 20) + "..." : session;
            payment.addElement(new Paragraph("Method: Stripe Checkout", normal));
            payment.addElement(new Paragraph("Session: " + shortSession, normal));
        }
        payment.addElement(new Paragraph("Currency: " + order.getCurrency(), normal));
        table.addCell(payment);

        doc.add(table);
    }

    private void addItemsTable(Document doc, Order order) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{4, 1, 1.5f, 1.5f});
        table.setWidthPercentage(100);
        table.setSpacingBefore(28);

        Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, MUTE);
        Font bodyBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, INK);
        Font body = FontFactory.getFont(FontFactory.HELVETICA, 10, SOFT);

        addHeaderCell(table, "ITEM", headFont, Element.ALIGN_LEFT);
        addHeaderCell(table, "QTY", headFont, Element.ALIGN_CENTER);
        addHeaderCell(table, "UNIT PRICE", headFont, Element.ALIGN_RIGHT);
        addHeaderCell(table, "SUBTOTAL", headFont, Element.ALIGN_RIGHT);

        boolean shade = false;
        for (OrderItem item : order.getItems()) {
            Color bg = shade ? CREAM : Color.WHITE;
            shade = !shade;

            PdfPCell nameCell = new PdfPCell();
            nameCell.setBorder(Rectangle.BOTTOM);
            nameCell.setBorderColor(LINE);
            nameCell.setPadding(12);
            nameCell.setBackgroundColor(bg);
            Paragraph itemName = new Paragraph(item.getName(), bodyBold);
            Paragraph sku = new Paragraph("SKU " + item.getSku(),
                    FontFactory.getFont(FontFactory.HELVETICA, 8, MUTE));
            sku.setSpacingBefore(2);
            nameCell.addElement(itemName);
            nameCell.addElement(sku);
            table.addCell(nameCell);

            addBodyCell(table, String.valueOf(item.getQuantity()), body, Element.ALIGN_CENTER, bg);
            addBodyCell(table, formatPrice(item.getUnitPriceCents(), order.getCurrency()), body, Element.ALIGN_RIGHT, bg);
            addBodyCell(table, formatPrice(item.getSubtotalCents(), order.getCurrency()), bodyBold, Element.ALIGN_RIGHT, bg);
        }

        doc.add(table);
    }

    private void addTotals(Document doc, Order order) throws DocumentException {
        PdfPTable wrapper = new PdfPTable(new float[]{2, 1});
        wrapper.setWidthPercentage(100);
        wrapper.setSpacingBefore(20);

        PdfPCell empty = new PdfPCell();
        empty.setBorder(Rectangle.NO_BORDER);
        wrapper.addCell(empty);

        PdfPCell totalsCell = new PdfPCell();
        totalsCell.setBorder(Rectangle.NO_BORDER);
        totalsCell.setPadding(0);

        Font label = FontFactory.getFont(FontFactory.HELVETICA, 10, SOFT);
        Font totalLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, INK);
        Font totalValue = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, SKY);

        PdfPTable subTable = new PdfPTable(2);
        subTable.setWidthPercentage(100);
        addTotalRow(subTable, "Subtotal", formatPrice(order.getTotalCents(), order.getCurrency()), label);
        addTotalRow(subTable, "Shipping", "Free", label);

        totalsCell.addElement(subTable);

        Paragraph divider = new Paragraph(" ");
        divider.setSpacingBefore(8);
        totalsCell.addElement(divider);

        PdfPTable grandTable = new PdfPTable(2);
        grandTable.setWidthPercentage(100);
        PdfPCell gl = new PdfPCell(new Phrase("Total", totalLabel));
        gl.setBorder(Rectangle.TOP);
        gl.setBorderColor(LINE);
        gl.setPaddingTop(10);
        gl.setPaddingBottom(4);
        grandTable.addCell(gl);

        PdfPCell gv = new PdfPCell(new Phrase(formatPrice(order.getTotalCents(), order.getCurrency()), totalValue));
        gv.setBorder(Rectangle.TOP);
        gv.setBorderColor(LINE);
        gv.setHorizontalAlignment(Element.ALIGN_RIGHT);
        gv.setPaddingTop(10);
        gv.setPaddingBottom(4);
        grandTable.addCell(gv);

        totalsCell.addElement(grandTable);

        wrapper.addCell(totalsCell);
        doc.add(wrapper);
    }

    private void addFooter(Document doc) throws DocumentException {
        Paragraph spacing = new Paragraph(" ");
        spacing.setSpacingBefore(40);
        doc.add(spacing);

        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setBorder(Rectangle.TOP);
        lineCell.setBorderColor(LINE);
        lineCell.setFixedHeight(1f);
        line.addCell(lineCell);
        doc.add(line);

        Font thanks = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, INK);
        Font note = FontFactory.getFont(FontFactory.HELVETICA, 9, SOFT);
        Font small = FontFactory.getFont(FontFactory.HELVETICA, 8, MUTE);

        Paragraph t = new Paragraph("Thank you for choosing Well-Wipes.", thanks);
        t.setAlignment(Element.ALIGN_CENTER);
        t.setSpacingBefore(20);
        doc.add(t);

        Paragraph n = new Paragraph(
                "Questions? Reply to your confirmation email - we read every one.", note);
        n.setAlignment(Element.ALIGN_CENTER);
        n.setSpacingBefore(6);
        doc.add(n);

        Paragraph s = new Paragraph(
                "This is a computer-generated invoice. No signature required.", small);
        s.setAlignment(Element.ALIGN_CENTER);
        s.setSpacingBefore(16);
        doc.add(s);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(LINE);
        cell.setPadding(10);
        cell.setHorizontalAlignment(align);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text, Font font, int align, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(LINE);
        cell.setPadding(12);
        cell.setHorizontalAlignment(align);
        cell.setBackgroundColor(bg);
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell l = new PdfPCell(new Phrase(label, font));
        l.setBorder(Rectangle.NO_BORDER);
        l.setPadding(4);
        table.addCell(l);

        PdfPCell v = new PdfPCell(new Phrase(value, font));
        v.setBorder(Rectangle.NO_BORDER);
        v.setHorizontalAlignment(Element.ALIGN_RIGHT);
        v.setPadding(4);
        table.addCell(v);
    }

    private String formatPrice(long cents, String currency) {
        BigDecimal amount = BigDecimal.valueOf(cents).divide(BigDecimal.valueOf(100));
        return "Rs " + amount.setScale(2, BigDecimal.ROUND_HALF_UP).toPlainString();
    }

    private String shortId(java.util.UUID id) {
        return id.toString().substring(0, 8).toUpperCase();
    }

    private String str(Object o) {
        return o == null ? "" : o.toString();
    }
}
