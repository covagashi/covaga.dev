using System;
using System.IO;
using System.Net.Http;
using System.Text;
using Eplan.EplApi.Base;
using Eplan.EplApi.Scripting;
using Eplan.EplApi.ApplicationFramework;

/// <summary>
/// Covaga — Event Client (pilar de automatizaciones).
///
/// Script RESIDENTE: al CARGARLO (EPLAN → Utilidades → Scripts → Cargar) queda
/// escuchando y reenvía eventos de EPLAN a tu tenant de Covaga Hub:
///     POST {SERVER_URL}/hook/{TENANT_ID}/{eventId}   (header X-Api-Key)
/// El servidor resuelve las rutas del tenant y entrega a los destinos
/// (Teams / webhook). En el PC no vive ningún secreto de destino ni lógica de
/// integración — solo captura y envío. Nunca lanza excepciones a EPLAN;
/// errores a {LOG_FILE}.
///
/// DOS CAMINOS:
///  1) Fiable y probable HOY: la acción CovagaEmit &lt;eventId&gt; (y CovagaEventTest)
///     hace el POST. Cablea tu macro/botón de export para que llame
///     "CovagaEmit pdf-exported" y funciona sin depender de nombres de evento.
///  2) Auto-captura: el handler OnUserPostAction (mecanismo [DeclareEventHandler],
///     confirmado por la API 2026) se dispara tras las acciones y mapea la acción
///     a un eventId. El NOMBRE de evento exacto y la lectura del nombre de acción
///     dependen de tu versión de EPLAN — CONFÍRMALOS (ver README) antes de fiarte.
/// </summary>
public class CovagaEventClient
{
    // ── Configuración editable ────────────────────────────────────────────
    private const string SERVER_URL = "https://covaga-hub.clopez-5fd.workers.dev";
    private const string TENANT_ID  = "PON_AQUI_TU_TENANT_ID";   // t_...  (créalo en el dashboard)
    private const string API_KEY    = "PON_AQUI_TU_API_KEY";     // se muestra una sola vez al crear la cuenta
    private const string LOG_FILE   = @"C:\Temp\covaga-eventclient.log";
    private const int HTTP_TIMEOUT_MS = 4000;

    // Evento del sistema al que nos suscribimos para la auto-captura. El nombre
    // debe existir en tu EPLAN: OnUserPostAction se dispara tras las acciones de
    // usuario. Si tu versión usa otro nombre, cámbialo aquí (soporta comodines).
    private const string POST_ACTION_EVENT = "Eplan.EplApi.OnUserPostAction";
    // ──────────────────────────────────────────────────────────────────────

    private static readonly HttpClient client = new HttpClient();

    // ── Ciclo de vida: cargado = escuchando ───────────────────────────────

    [DeclareRegister]
    public void Register()
    {
        client.Timeout = TimeSpan.FromMilliseconds(HTTP_TIMEOUT_MS);
        string msg = "covaga event client: cargado, reenviando eventos a " + SERVER_URL + "/hook/" + TENANT_ID;
        new BaseException(msg, MessageLevel.Message).FixMessage();
        Log(msg);
    }

    [DeclareUnregister]
    public void Unregister()
    {
        Log("covaga event client: descargado, deja de escuchar");
    }

    // ── Camino 1: acciones explícitas (fiables) ───────────────────────────

    /// Emite un evento a mano / desde una macro: acción "CovagaEmit pdf-exported".
    [DeclareAction("CovagaEmit")]
    public void Emit(string eventId)
    {
        try
        {
            if (string.IsNullOrEmpty(eventId)) { Log("CovagaEmit sin eventId"); return; }
            Send(eventId, "{\"source\":\"CovagaEmit\"}");
        }
        catch (Exception ex) { Log("CovagaEmit error: " + ex.Message); }
    }

    /// Prueba de humo: envía un pdf-exported de mentira para verificar el POST.
    [DeclareAction("CovagaEventTest")]
    public void Test()
    {
        try
        {
            Send("pdf-exported", "{\"test\":true,\"project\":\"PRUEBA\"}");
            new BaseException("covaga event client: evento de prueba enviado", MessageLevel.Message).FixMessage();
        }
        catch (Exception ex) { Log("CovagaEventTest error: " + ex.Message); }
    }

    // ── Camino 2: auto-captura tras acciones (confirmar en EPLAN) ──────────

    [DeclareEventHandler(POST_ACTION_EVENT)]
    public void OnPostAction(IEventParameter oParam)
    {
        try
        {
            string actionName = ExtractActionName(oParam);
            string eventId = MapAction(actionName);
            if (eventId == null) return;   // acción que no nos interesa
            Send(eventId, "{\"action\":\"" + EscapeJson(actionName) + "\"}");
        }
        catch (Exception ex) { Log("OnPostAction error: " + ex.Message); }
    }

    /// Mapea el nombre de acción de EPLAN a nuestro eventId (o null si se ignora).
    /// Ajusta las coincidencias a las acciones reales de tu EPLAN.
    private static string MapAction(string action)
    {
        if (string.IsNullOrEmpty(action)) return null;
        string a = action.ToLowerInvariant();
        if (a.Contains("pdf")) return "pdf-exported";
        if (a.Contains("partslist") || a.Contains("bom")) return "bom-exported";
        if (a.Contains("projectclose") || a.Contains("backup")) return "project-closed";
        return null;
    }

    /// Lee el nombre de la acción del parámetro del evento. La forma concreta
    /// depende de la versión de EPLAN: aquí un mejor-esfuerzo defensivo. CONFIRMA
    /// contra tu API (IEventParameter / ActionEvent) y ajusta si hace falta.
    private static string ExtractActionName(IEventParameter oParam)
    {
        try
        {
            if (oParam == null) return "";
            // Muchas versiones exponen el nombre como primer parámetro string del evento.
            var s = oParam.ToString();
            return s ?? "";
        }
        catch { return ""; }
    }

    // ── HTTP + utilidades (mismo patrón defensivo que CovagaDbSnapshot.cs) ──

    private void Send(string eventId, string jsonBody)
    {
        string url = SERVER_URL + "/hook/" + TENANT_ID + "/" + Uri.EscapeDataString(eventId);
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
        var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
        request.Headers.Add("X-Api-Key", API_KEY);
        HttpResponseMessage response = client.SendAsync(request).GetAwaiter().GetResult();
        string body = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
        Log(eventId + " → HTTP " + (int)response.StatusCode + " " + Truncate(body, 200));
    }

    private static string Truncate(string s, int n)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Length <= n ? s : s.Substring(0, n);
    }

    private static string EscapeJson(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        var sb = new StringBuilder(s.Length + 8);
        foreach (char c in s)
        {
            switch (c)
            {
                case '"': sb.Append("\\\""); break;
                case '\\': sb.Append("\\\\"); break;
                case '\n': sb.Append("\\n"); break;
                case '\r': sb.Append("\\r"); break;
                case '\t': sb.Append("\\t"); break;
                default: sb.Append(c); break;
            }
        }
        return sb.ToString();
    }

    private static void Log(string line)
    {
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(LOG_FILE));
            File.AppendAllText(LOG_FILE, DateTime.Now.ToString("s") + "  " + line + Environment.NewLine);
        }
        catch { /* el log jamás debe romper el script */ }
    }
}
