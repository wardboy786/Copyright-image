// COPY AND PASTE THIS ENTIRE CODE BLOCK INTO YOUR FILE

package com.imagerights.ai;

import android.os.Bundle;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Get the Capacitor webview
    WebView webview = getBridge().getWebView();

    // Set a custom WebChromeClient
    webview.setWebChromeClient(new WebChromeClient() {
      @Override
      public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
        // Log the message to Android's logcat
        String logMessage = consoleMessage.message() + " -- From line "
                             + consoleMessage.lineNumber() + " of "
                             + consoleMessage.sourceId();

        // Use Log.d for debug, Log.e for error, etc., based on message level
        switch (consoleMessage.messageLevel()) {
          case ERROR:
            Log.e("MyWebView", logMessage);
            break;
          case WARNING:
            Log.w("MyWebView", logMessage);
            break;
          default:
            Log.i("MyWebView", logMessage);
            break;
        }
        return true;
      }
    });
  }
}
