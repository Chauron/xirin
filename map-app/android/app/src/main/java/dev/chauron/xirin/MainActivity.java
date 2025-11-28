package dev.chauron.xirin;

import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.graphics.Color;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Window window = getWindow();
        
        // Clear any light status bar flags to ensure dark background
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            window.getDecorView().setSystemUiVisibility(0); // Clear all flags including SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
        }
        
        // Enable edge-to-edge display (full screen with system bars)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false);
        }
        
        // Set dark semi-transparent status bar and navigation bar
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.setStatusBarColor(Color.parseColor("#CC000000"));
        window.setNavigationBarColor(Color.parseColor("#CC000000"));
    }
}
