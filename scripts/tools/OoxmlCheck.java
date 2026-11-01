import java.io.*;
import java.util.*;
import java.util.zip.*;
import javax.xml.parsers.*;
import org.w3c.dom.*;

/**
 * Verifica pacotes OOXML (xlsx/docx): ZIP íntegro, XML bem-formado em todas as partes,
 * [Content_Types].xml presente e todos os alvos de relacionamentos internos existentes.
 * Uso: java OoxmlCheck.java arquivo1.xlsx arquivo2.docx ...
 */
public class OoxmlCheck {
  public static void main(String[] args) throws Exception {
    int fails = 0;
    DocumentBuilderFactory f = DocumentBuilderFactory.newInstance();
    f.setNamespaceAware(true);
    for (String a : args) {
      List<String> problems = new ArrayList<>();
      Map<String, byte[]> parts = new LinkedHashMap<>();
      try (ZipFile z = new ZipFile(a)) {
        for (Enumeration<? extends ZipEntry> e = z.entries(); e.hasMoreElements();) {
          ZipEntry en = e.nextElement();
          try (InputStream in = z.getInputStream(en)) { parts.put(en.getName(), in.readAllBytes()); }
        }
      } catch (Exception ex) { problems.add("ZIP inválido: " + ex.getMessage()); }
      if (!parts.containsKey("[Content_Types].xml")) problems.add("Falta [Content_Types].xml");
      int xml = 0;
      for (Map.Entry<String, byte[]> p : parts.entrySet()) {
        if (!(p.getKey().endsWith(".xml") || p.getKey().endsWith(".rels"))) continue;
        xml++;
        try {
          Document d = f.newDocumentBuilder().parse(new ByteArrayInputStream(p.getValue()));
          if (p.getKey().endsWith(".rels")) {
            String base = p.getKey().replace("_rels/", "").replaceAll("\\.rels$", "");
            String dir = base.contains("/") ? base.substring(0, base.lastIndexOf('/') + 1) : "";
            NodeList rels = d.getElementsByTagNameNS("*", "Relationship");
            for (int i = 0; i < rels.getLength(); i++) {
              Element r = (Element) rels.item(i);
              if ("External".equals(r.getAttribute("TargetMode"))) continue;
              String t = r.getAttribute("Target");
              String full = t.startsWith("/") ? t.substring(1) : normalize(dir + t);
              if (!parts.containsKey(full)) problems.add("Relacionamento quebrado em " + p.getKey() + ": " + t);
            }
          }
        } catch (Exception ex) { problems.add("XML malformado em " + p.getKey() + ": " + ex.getMessage()); }
      }
      if (problems.isEmpty()) System.out.println("OK   " + a + " (" + parts.size() + " partes, " + xml + " XML)");
      else { fails++; System.out.println("FALHA " + a); problems.forEach(s -> System.out.println("   - " + s)); }
    }
    System.exit(fails == 0 ? 0 : 1);
  }
  static String normalize(String p) {
    Deque<String> st = new ArrayDeque<>();
    for (String s : p.split("/")) { if (s.equals("..")) { if (!st.isEmpty()) st.removeLast(); } else if (!s.isEmpty() && !s.equals(".")) st.addLast(s); }
    return String.join("/", st);
  }
}
