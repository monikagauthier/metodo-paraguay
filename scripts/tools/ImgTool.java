import javax.imageio.*;
import javax.imageio.stream.*;
import java.awt.*;
import java.awt.image.*;
import java.io.*;
import java.util.*;

/**
 * Ferramenta de imagens sem dependências (usa apenas o JDK).
 * Uso:
 *   java ImgTool.java info <arquivos...>
 *   java ImgTool.java jpg <entrada> <saida.jpg> <larguraMax> <qualidade0-1> [corFundoHex]
 *   java ImgTool.java png <entrada> <saida.png> <larguraMax>
 *   java ImgTool.java sheet <saida.jpg> <colunas> <tamanho> <arquivos...>
 */
public class ImgTool {
  public static void main(String[] a) throws Exception {
    switch (a[0]) {
      case "info" -> {
        for (int i = 1; i < a.length; i++) {
          BufferedImage im = ImageIO.read(new File(a[i]));
          boolean alpha = im.getColorModel().hasAlpha();
          int transparent = 0;
          if (alpha) {
            for (int y = 0; y < im.getHeight(); y += 8) for (int x = 0; x < im.getWidth(); x += 8)
              if (((im.getRGB(x, y) >>> 24) & 0xff) < 250) transparent++;
          }
          System.out.println(im.getWidth() + "x" + im.getHeight() + " alpha=" + alpha + " transpSamples=" + transparent + "  " + a[i]);
        }
      }
      case "jpg" -> {
        BufferedImage src = ImageIO.read(new File(a[1]));
        int maxW = Integer.parseInt(a[3]);
        float q = Float.parseFloat(a[4]);
        Color bg = a.length > 5 ? Color.decode(a[5]) : Color.WHITE;
        BufferedImage out = scale(src, maxW, BufferedImage.TYPE_INT_RGB, bg);
        writeJpg(out, new File(a[2]), q);
      }
      case "png" -> {
        BufferedImage src = ImageIO.read(new File(a[1]));
        BufferedImage out = scale(src, Integer.parseInt(a[3]), BufferedImage.TYPE_INT_ARGB, null);
        ImageIO.write(out, "png", new File(a[2]));
      }
      case "sheet" -> {
        int cols = Integer.parseInt(a[2]), size = Integer.parseInt(a[3]);
        int n = a.length - 4, rows = (n + cols - 1) / cols;
        BufferedImage sheet = new BufferedImage(cols * size, rows * (size + 18), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = sheet.createGraphics();
        g.setColor(Color.DARK_GRAY); g.fillRect(0, 0, sheet.getWidth(), sheet.getHeight());
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        for (int i = 0; i < n; i++) {
          BufferedImage im = ImageIO.read(new File(a[i + 4]));
          double s = Math.min((double) size / im.getWidth(), (double) size / im.getHeight());
          int w = (int) (im.getWidth() * s), h = (int) (im.getHeight() * s);
          int x = (i % cols) * size, y = (i / cols) * (size + 18);
          g.drawImage(im, x + (size - w) / 2, y + (size - h) / 2, w, h, null);
          g.setColor(Color.YELLOW); g.setFont(new Font("SansSerif", Font.BOLD, 13));
          g.drawString(String.valueOf(i + 1), x + 4, y + size + 14);
        }
        writeJpg(sheet, new File(a[1]), 0.8f);
      }
      default -> throw new IllegalArgumentException(a[0]);
    }
  }

  static BufferedImage scale(BufferedImage src, int maxW, int type, Color bg) {
    double s = Math.min(1.0, (double) maxW / src.getWidth());
    int w = Math.max(1, (int) Math.round(src.getWidth() * s)), h = Math.max(1, (int) Math.round(src.getHeight() * s));
    // redução em etapas para melhor qualidade
    BufferedImage cur = src;
    int cw = src.getWidth(), ch = src.getHeight();
    while (cw / 2 >= w && ch / 2 >= h) {
      cw /= 2; ch /= 2;
      BufferedImage t = new BufferedImage(cw, ch, BufferedImage.TYPE_INT_ARGB);
      Graphics2D g = t.createGraphics();
      g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
      g.drawImage(cur, 0, 0, cw, ch, null); g.dispose(); cur = t;
    }
    BufferedImage out = new BufferedImage(w, h, type);
    Graphics2D g = out.createGraphics();
    if (bg != null) { g.setColor(bg); g.fillRect(0, 0, w, h); }
    g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
    g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
    g.drawImage(cur, 0, 0, w, h, null); g.dispose();
    return out;
  }

  static void writeJpg(BufferedImage im, File f, float q) throws IOException {
    ImageWriter w = ImageIO.getImageWritersByFormatName("jpg").next();
    ImageWriteParam p = w.getDefaultWriteParam();
    p.setCompressionMode(ImageWriteParam.MODE_EXPLICIT); p.setCompressionQuality(q);
    try (ImageOutputStream os = ImageIO.createImageOutputStream(f)) {
      w.setOutput(os); w.write(null, new IIOImage(im, null, null), p);
    }
    w.dispose();
  }
}
