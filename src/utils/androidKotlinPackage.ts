import JSZip from 'jszip';
import { LoreDocument, Story, Universe, ImageAsset } from '../types/lore';
import { serializeMarkdown } from './frontmatter';

/**
 * Generates a complete, native Android project built with Kotlin and the Android SDK (Gradle Kotlin DSL).
 * Compatible with Android Studio (Ladybug / Iguana / Giraffe) and compilable directly via
 * `./gradlew assembleDebug` or GitHub Actions to produce a native Android APK.
 */
export async function downloadAndroidKotlinProjectPackage(
  docs: LoreDocument[],
  stories: Story[],
  universes: Universe[],
  images: ImageAsset[],
  universeName: string
): Promise<void> {
  const zip = new JSZip();

  // Serialized initial seed data
  const seedJson = JSON.stringify({
    universeName,
    exportedAt: new Date().toISOString(),
    universes,
    stories,
    documents: docs,
  }, null, 2);

  // 1. Root settings.gradle.kts
  const settingsGradle = `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Grimorio-LoreStudio-Kotlin"
include(":app")
`;
  zip.file('settings.gradle.kts', settingsGradle);

  // 2. Root build.gradle.kts
  const rootBuildGradle = `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.0" apply false
    id("com.google.devtools.ksp") version "2.0.0-1.0.24" apply false
}
`;
  zip.file('build.gradle.kts', rootBuildGradle);

  // 3. gradle.properties
  const gradleProperties = `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`;
  zip.file('gradle.properties', gradleProperties);

  // 4. Gradle Wrapper
  const gradleWrapperProps = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
  zip.folder('gradle')?.folder('wrapper')?.file('gradle-wrapper.properties', gradleWrapperProps);

  // 5. gradlew.bat (Windows)
  const gradlewBat = `@rem
@rem Copyright 2015 the original author or authors.
@rem
@if "%DEBUG%" == "" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows
@rem
@rem ##########################################################################
set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"
java -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: JAVA_HOME is not set and no 'java' command could be found in your PATH.
    exit /b 1
)
gradle wrapper --gradle-version 8.7 >nul 2>&1
if exist "%DIRNAME%gradle\\wrapper\\gradle-wrapper.jar" (
    java -jar "%DIRNAME%gradle\\wrapper\\gradle-wrapper.jar" %*
) else (
    gradle %*
)
`;
  zip.file('gradlew.bat', gradlewBat);

  // 6. gradlew (Linux/macOS)
  const gradlewSh = `#!/bin/sh
DIRNAME=\`dirname "$0"\`
if [ -f "$DIRNAME/gradle/wrapper/gradle-wrapper.jar" ]; then
    exec java -jar "$DIRNAME/gradle/wrapper/gradle-wrapper.jar" "$@"
else
    exec gradle "$@"
fi
`;
  zip.file('gradlew', gradlewSh);

  // 7. app/build.gradle.kts
  const appBuildGradle = `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.grimorio.lorestudio"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.grimorio.lorestudio"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "2.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        viewBinding = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.3")
    implementation("androidx.activity:activity-compose:1.9.0")
    
    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    
    // Room Database (Persistencia Offline en Android con Kotlin)
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // JSON Parser
    implementation("com.google.code.gson:gson:2.11.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    
    debugImplementation("androidx.compose.ui:ui-tooling")
}
`;
  zip.file('app/build.gradle.kts', appBuildGradle);

  // 8. app/proguard-rules.pro
  zip.file('app/proguard-rules.pro', '# Proguard rules for Grimorio Lore Studio\n-keepattributes *Annotation*\n');

  // 9. AndroidManifest.xml
  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.Grimorio"
        android:hardwareAccelerated="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.Grimorio"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`;
  zip.file('app/src/main/AndroidManifest.xml', androidManifest);

  // 10. Android Resources (strings, colors, themes)
  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Grimorio</string>
    <string name="welcome_universe">${universeName.replace(/"/g, '&quot;')}</string>
</resources>
`;
  zip.file('app/src/main/res/values/strings.xml', stringsXml);

  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="bg_dark">#0A0A0A</color>
    <color name="amber_primary">#D97706</color>
    <color name="amber_light">#F59E0B</color>
    <color name="surface_dark">#171717</color>
    <color name="text_white">#F5F5F5</color>
</resources>
`;
  zip.file('app/src/main/res/values/colors.xml', colorsXml);

  const themesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.Grimorio" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">@color/bg_dark</item>
        <item name="android:navigationBarColor">@color/bg_dark</item>
        <item name="android:windowBackground">@color/bg_dark</item>
    </style>
</resources>
`;
  zip.file('app/src/main/res/values/themes.xml', themesXml);

  // 11. Kotlin Source: LoreModels.kt
  const loreModelsKt = `package com.grimorio.lorestudio.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "universes")
data class UniverseEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val createdAt: Long,
    val lastModified: Long
)

@Entity(tableName = "stories")
data class StoryEntity(
    @PrimaryKey val id: String,
    val universeId: String,
    val title: String,
    val synopsis: String,
    val status: String,
    val order: Int,
    val createdAt: Long,
    val lastModified: Long
)

@Entity(tableName = "documents")
data class LoreDocumentEntity(
    @PrimaryKey val id: String,
    val universeId: String,
    val storyId: String?,
    val subfolder: String, // chapters, characters, creatures, locations, notes
    val title: String,
    val type: String, // story, character, creature, location, timeline, note
    val content: String,
    val rawMarkdown: String,
    val tags: String,
    val wordCount: Int,
    val lastModified: Long,
    // Atributos específicos
    val role: String? = null,
    val race: String? = null,
    val faction: String? = null,
    val dangerLevel: String? = null,
    val habitat: String? = null,
    val dateOrEra: String? = null
)
`;
  zip.file('app/src/main/java/com/grimorio/lorestudio/data/LoreModels.kt', loreModelsKt);

  // 12. Kotlin Source: LoreDao.kt (Includes full Delete options in every section)
  const loreDaoKt = `package com.grimorio.lorestudio.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface LoreDao {
    // --- Universos ---
    @Query("SELECT * FROM universes ORDER BY lastModified DESC")
    fun getAllUniverses(): Flow<List<UniverseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUniverse(universe: UniverseEntity)

    @Query("DELETE FROM universes WHERE id = :universeId")
    suspend fun deleteUniverse(universeId: String)

    // --- Historias ---
    @Query("SELECT * FROM stories WHERE universeId = :universeId ORDER BY \`order\` ASC, createdAt ASC")
    fun getStoriesByUniverse(universeId: String): Flow<List<StoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStory(story: StoryEntity)

    @Query("DELETE FROM stories WHERE id = :storyId")
    suspend fun deleteStory(storyId: String)

    // --- Documentos & Secciones (Personajes, Bestiario, Cronología, Notas, Capítulos) ---
    @Query("SELECT * FROM documents WHERE universeId = :universeId ORDER BY lastModified DESC")
    fun getAllDocuments(universeId: String): Flow<List<LoreDocumentEntity>>

    @Query("SELECT * FROM documents WHERE universeId = :universeId AND type = :type ORDER BY lastModified DESC")
    fun getDocumentsByType(universeId: String, type: String): Flow<List<LoreDocumentEntity>>

    @Query("SELECT * FROM documents WHERE storyId = :storyId AND subfolder = :subfolder ORDER BY lastModified DESC")
    fun getDocumentsBySubfolder(storyId: String, subfolder: String): Flow<List<LoreDocumentEntity>>

    @Query("SELECT * FROM documents WHERE id = :id LIMIT 1")
    suspend fun getDocumentById(id: String): LoreDocumentEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDocument(doc: LoreDocumentEntity)

    @Update
    suspend fun updateDocument(doc: LoreDocumentEntity)

    // Opción para eliminar en cada sección:
    @Query("DELETE FROM documents WHERE id = :docId")
    suspend fun deleteDocument(docId: String)

    @Query("DELETE FROM documents WHERE storyId = :storyId")
    suspend fun deleteDocumentsByStory(storyId: String)

    @Query("DELETE FROM documents WHERE universeId = :universeId")
    suspend fun deleteDocumentsByUniverse(universeId: String)
}
`;
  zip.file('app/src/main/java/com/grimorio/lorestudio/data/LoreDao.kt', loreDaoKt);

  // 13. Kotlin Source: LoreDatabase.kt
  const loreDatabaseKt = `package com.grimorio.lorestudio.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [UniverseEntity::class, StoryEntity::class, LoreDocumentEntity::class],
    version = 1,
    exportSchema = false
)
abstract class LoreDatabase : RoomDatabase() {
    abstract fun loreDao(): LoreDao

    companion object {
        @Volatile
        private var INSTANCE: LoreDatabase? = null

        fun getDatabase(context: Context): LoreDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    LoreDatabase::class.java,
                    "grimorio_lore_offline.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`;
  zip.file('app/src/main/java/com/grimorio/lorestudio/data/LoreDatabase.kt', loreDatabaseKt);

  // 14. Kotlin Source: UI Components (Theme & Screens with delete buttons everywhere)
  const themeKt = `package com.grimorio.lorestudio.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val DarkGold = Color(0xFFD97706)
val LightGold = Color(0xFFF59E0B)
val BackgroundDark = Color(0xFF0A0A0A)
val SurfaceDark = Color(0xFF171717)
val SurfaceCard = Color(0xFF262626)
val DangerRed = Color(0xFFE11D48)

private val DarkColorScheme = darkColorScheme(
    primary = DarkGold,
    secondary = LightGold,
    background = BackgroundDark,
    surface = SurfaceDark,
    error = DangerRed
)

@Composable
fun GrimorioTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
`;
  zip.file('app/src/main/java/com/grimorio/lorestudio/ui/theme/Theme.kt', themeKt);

  // 15. Kotlin Source: MainActivity.kt (Full Native Jetpack Compose App with section delete)
  const mainActivityKt = `package com.grimorio.lorestudio

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.lifecycleScope
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.grimorio.lorestudio.data.*
import com.grimorio.lorestudio.ui.theme.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.InputStreamReader

enum class LoreSection(val title: String, val typeFilter: String?) {
    STORIES("Historias", "story"),
    CHARACTERS("Personajes", "character"),
    BESTIARY("Bestiario", "creature"),
    TIMELINE("Cronología", "timeline"),
    NOTES("Notas & Lore", "note")
}

class MainActivity : ComponentActivity() {

    private lateinit var db: LoreDatabase

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        db = LoreDatabase.getDatabase(this)

        // Preload initial seed lore if database is fresh
        preloadSeedDataIfNeeded()

        setContent {
            GrimorioTheme {
                MainAppScreen(db = db)
            }
        }
    }

    private fun preloadSeedDataIfNeeded() {
        lifecycleScope.launch(Dispatchers.IO) {
            val existing = db.loreDao().getAllUniverses().first()
            if (existing.isEmpty()) {
                try {
                    assets.open("grimorio_initial_data.json").use { stream ->
                        val reader = InputStreamReader(stream)
                        val json = Gson().fromJson(reader, JsonObject::class.java)
                        
                        val univName = json.get("universeName")?.asString ?: "Aethelgard"
                        val univId = "univ-kotlin-default"
                        db.loreDao().insertUniverse(
                            UniverseEntity(
                                id = univId,
                                name = univName,
                                description = "Mundo de lore offline cargado desde Grimorio.",
                                createdAt = System.currentTimeMillis(),
                                lastModified = System.currentTimeMillis()
                            )
                        )

                        // Insert initial stories
                        val storiesArr = json.getAsJsonArray("stories")
                        storiesArr?.forEach { element ->
                            val s = element.asJsonObject
                            db.loreDao().insertStory(
                                StoryEntity(
                                    id = s.get("id")?.asString ?: "story-1",
                                    universeId = univId,
                                    title = s.get("title")?.asString ?: "Libro 1",
                                    synopsis = s.get("synopsis")?.asString ?: "",
                                    status = "in_progress",
                                    order = 1,
                                    createdAt = System.currentTimeMillis(),
                                    lastModified = System.currentTimeMillis()
                                )
                            )
                        }

                        // Insert initial documents
                        val docsArr = json.getAsJsonArray("documents")
                        docsArr?.forEach { element ->
                            val d = element.asJsonObject
                            val fm = d.getAsJsonObject("frontmatter")
                            db.loreDao().insertDocument(
                                LoreDocumentEntity(
                                    id = d.get("id")?.asString ?: "doc-\${System.currentTimeMillis()}",
                                    universeId = univId,
                                    storyId = d.get("storyId")?.asString,
                                    subfolder = d.get("subfolder")?.asString ?: "notes",
                                    title = fm?.get("title")?.asString ?: d.get("fileName")?.asString ?: "Nota",
                                    type = fm?.get("type")?.asString ?: "note",
                                    content = d.get("content")?.asString ?: "",
                                    rawMarkdown = d.get("rawMarkdown")?.asString ?: "",
                                    tags = "",
                                    wordCount = d.get("wordCount")?.asInt ?: 100,
                                    lastModified = System.currentTimeMillis(),
                                    role = fm?.get("role")?.asString,
                                    race = fm?.get("race")?.asString,
                                    faction = fm?.get("faction")?.asString,
                                    dangerLevel = fm?.get("danger_level")?.asString,
                                    habitat = fm?.get("habitat")?.asString
                                )
                            )
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen(db: LoreDatabase) {
    val coroutineScope = rememberCoroutineScope()
    var currentSection by remember { mutableStateOf(LoreSection.STORIES) }
    var activeUniverseId by remember { mutableStateOf("univ-kotlin-default") }
    var editingDoc by remember { mutableStateOf<LoreDocumentEntity?>(null) }
    
    // Deletion confirmation state
    var docToDelete by remember { mutableStateOf<LoreDocumentEntity?>(null) }
    var storyToDelete by remember { mutableStateOf<StoryEntity?>(null) }

    // Live data collection
    val allDocs by db.loreDao().getAllDocuments(activeUniverseId).collectAsState(initial = emptyList())
    val allStories by db.loreDao().getStoriesByUniverse(activeUniverseId).collectAsState(initial = emptyList())

    val filteredDocs = remember(allDocs, currentSection) {
        when (currentSection) {
            LoreSection.STORIES -> allDocs.filter { it.subfolder == "chapters" || it.type == "story" }
            LoreSection.CHARACTERS -> allDocs.filter { it.type == "character" || it.subfolder == "characters" }
            LoreSection.BESTIARY -> allDocs.filter { it.type == "creature" || it.subfolder == "creatures" }
            LoreSection.TIMELINE -> allDocs.filter { it.type == "timeline" }
            LoreSection.NOTES -> allDocs.filter { it.subfolder == "notes" || it.type == "note" }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("📖 Grimorio Android", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = DarkGold)
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0x2210B981)
                        ) {
                            Text(
                                "Kotlin Nativo",
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                fontSize = 10.sp,
                                color = Color(0xFF34D399),
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                },
                actions = {
                    // Botón para crear nueva nota rápida en esta sección
                    IconButton(onClick = {
                        val newId = "doc-\${System.currentTimeMillis()}"
                        val newDoc = LoreDocumentEntity(
                            id = newId,
                            universeId = activeUniverseId,
                            storyId = allStories.firstOrNull()?.id,
                            subfolder = when (currentSection) {
                                LoreSection.STORIES -> "chapters"
                                LoreSection.CHARACTERS -> "characters"
                                LoreSection.BESTIARY -> "creatures"
                                LoreSection.TIMELINE -> "notes"
                                LoreSection.NOTES -> "notes"
                            },
                            title = "Nueva entrada de \${currentSection.title}",
                            type = currentSection.typeFilter ?: "note",
                            content = "# Nueva entrada\\n\\nEscribe tu lore aquí...",
                            rawMarkdown = "",
                            tags = "",
                            wordCount = 5,
                            lastModified = System.currentTimeMillis()
                        )
                        coroutineScope.launch {
                            db.loreDao().insertDocument(newDoc)
                            editingDoc = newDoc
                        }
                    }) {
                        Icon(Icons.Default.Add, contentDescription = "Nuevo elemento", tint = LightGold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SurfaceDark)
            )
        },
        bottomBar = {
            NavigationBar(containerColor = SurfaceDark) {
                LoreSection.values().forEach { sec ->
                    NavigationBarItem(
                        selected = currentSection == sec,
                        onClick = { currentSection = sec; editingDoc = null },
                        icon = {
                            when (sec) {
                                LoreSection.STORIES -> Icon(Icons.Default.Book, contentDescription = sec.title)
                                LoreSection.CHARACTERS -> Icon(Icons.Default.Person, contentDescription = sec.title)
                                LoreSection.BESTIARY -> Icon(Icons.Default.Warning, contentDescription = sec.title)
                                LoreSection.TIMELINE -> Icon(Icons.Default.Schedule, contentDescription = sec.title)
                                LoreSection.NOTES -> Icon(Icons.Default.Description, contentDescription = sec.title)
                            }
                        },
                        label = { Text(sec.title, fontSize = 10.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = DarkGold,
                            indicatorColor = Color(0x33D97706),
                            unselectedIconColor = Color.Gray,
                            selectedTextColor = LightGold,
                            unselectedTextColor = Color.Gray
                        )
                    )
                }
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize().background(BackgroundDark)) {
            if (editingDoc != null) {
                // Pantalla de Edición con Botón de Eliminar
                DocumentEditorScreen(
                    doc = editingDoc!!,
                    onSave = { updatedDoc ->
                        coroutineScope.launch {
                            db.loreDao().updateDocument(updatedDoc)
                            editingDoc = null
                        }
                    },
                    onDelete = { docToDeleteId ->
                        coroutineScope.launch {
                            db.loreDao().deleteDocument(docToDeleteId)
                            editingDoc = null
                        }
                    },
                    onBack = { editingDoc = null }
                )
            } else {
                // Lista de elementos de la sección activa
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Text(
                            text = "Sección: \${currentSection.title} (\${filteredDocs.size})",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.LightGray,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )
                    }

                    if (filteredDocs.isEmpty()) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 32.dp),
                                colors = CardDefaults.cardColors(containerColor = SurfaceDark)
                            ) {
                                Column(
                                    modifier = Modifier.padding(24.dp).fillMaxWidth(),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text("Sin entradas en esta sección aún.", color = Color.Gray, fontSize = 13.sp)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text("Usa el botón '+' arriba para crear una.", color = LightGold, fontSize = 12.sp)
                                }
                            }
                        }
                    }

                    items(filteredDocs, key = { it.id }) { doc ->
                        // Tarjeta con opción de eliminar en cada sección
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clickable { editingDoc = doc }
                                ) {
                                    Text(
                                        text = doc.title,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        color = Color.White,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "\${doc.type.capitalize()} • \${doc.wordCount} palabras",
                                        fontSize = 11.sp,
                                        color = Color.Gray
                                    )
                                }

                                // Botón para eliminar en esta sección
                                IconButton(
                                    onClick = { docToDelete = doc },
                                    modifier = Modifier.size(36.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Delete,
                                        contentDescription = "Eliminar",
                                        tint = Color(0xFFF43F5E)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Diálogo de Confirmación para Eliminar Documento en cualquier sección
            docToDelete?.let { target ->
                AlertDialog(
                    onDismissRequest = { docToDelete = null },
                    title = { Text("¿Eliminar entrada?") },
                    text = { Text("Se eliminará permanentemente '\${target.title}' de la base de datos local.") },
                    confirmButton = {
                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    db.loreDao().deleteDocument(target.id)
                                    docToDelete = null
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = DangerRed)
                        ) {
                            Text("Eliminar")
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { docToDelete = null }) {
                            Text("Cancelar", color = Color.LightGray)
                        }
                    },
                    containerColor = SurfaceDark
                )
            }
        }
    }
}

@Composable
fun DocumentEditorScreen(
    doc: LoreDocumentEntity,
    onSave: (LoreDocumentEntity) -> Unit,
    onDelete: (String) -> Unit,
    onBack: () -> Unit
) {
    var title by remember { mutableStateOf(doc.title) }
    var content by remember { mutableStateOf(doc.content) }
    var showDeleteConfirm by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize().padding(14.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Volver", tint = Color.White)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                // Opción para eliminar documento directamente desde el editor
                IconButton(onClick = { showDeleteConfirm = true }) {
                    Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = DangerRed)
                }
                Button(
                    onClick = {
                        val wordCount = content.trim().split("\\\\s+".toRegex()).filter { it.isNotEmpty() }.size
                        onSave(doc.copy(title = title, content = content, wordCount = wordCount, lastModified = System.currentTimeMillis()))
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DarkGold)
                ) {
                    Text("Guardar", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Título", color = Color.Gray) },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = DarkGold,
                unfocusedBorderColor = Color.DarkGray
            )
        )

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = content,
            onValueChange = { content = it },
            label = { Text("Contenido Markdown", color = Color.Gray) },
            modifier = Modifier.fillMaxWidth().weight(1f),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = DarkGold,
                unfocusedBorderColor = Color.DarkGray
            )
        )
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("¿Eliminar documento?") },
            text = { Text("¿Deseas eliminar permanentemente '\${doc.title}'?") },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteConfirm = false
                        onDelete(doc.id)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DangerRed)
                ) {
                    Text("Eliminar")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text("Cancelar", color = Color.LightGray)
                }
            },
            containerColor = SurfaceDark
        )
    }
}
`;
  zip.file('app/src/main/java/com/grimorio/lorestudio/MainActivity.kt', mainActivityKt);

  // 16. Embed JSON Seed Data inside app/src/main/assets/
  zip.file('app/src/main/assets/grimorio_initial_data.json', seedJson);

  // 17. Automated Windows Compilation Batch Script (Kotlin + Android SDK)
  const batKotlinBuilder = `@echo off
chcp 65001 >nul
title Grimorio - Compilador de APK Nativo en Kotlin (Android SDK)

echo ======================================================================
echo    GRIMORIO - APLICACION NATIVA ANDROID EN KOTLIN + ANDROID SDK
echo ======================================================================
echo.

:: 1. Verificar JDK de Java (Requerido para compilar proyectos Kotlin en Android)
echo [1/3] Verificando entorno Java JDK...
where javac >nul 2>nul
if %errorlevel% neq 0 (
    echo [AVISO] 'javac' no esta en el PATH. Si tienes Android Studio instalado,
    echo puedes abrir esta carpeta directamente en Android Studio y compilar con 1 clic.
)

:: 2. Compilar APK usando el wrapper de Gradle
echo [2/3] Compilando archivo .APK nativo en Kotlin con Gradle...
if exist "gradlew.bat" (
    call gradlew.bat assembleDebug
    if %errorlevel% equ 0 (
        echo.
        echo ======================================================================
        echo  ¡EXITO! Tu archivo APK nativo de Android en Kotlin se genero en:
        echo  app\\build\\outputs\\apk\\debug\\app-debug.apk
        echo ======================================================================
        echo  Transfiere ese archivo APK a tu telefono Android e instalalo.
        echo ======================================================================
        if exist "app\\build\\outputs\\apk\\debug" (
            explorer app\\build\\outputs\\apk\\debug
        )
    ) else (
        echo.
        echo [INFO] Para compilar con Android Studio:
        echo 1. Abre Android Studio.
        echo 2. Selecciona "Open" y elige esta carpeta.
        echo 3. Haz clic en "Build -> Build Bundle(s) / APK(s) -> Build APK(s)".
    )
) else (
    echo [INFO] Abre esta carpeta en Android Studio para compilar el APK.
)

echo.
pause
`;
  zip.file('compilar_apk_nativo_kotlin.bat', batKotlinBuilder);

  // 18. Automated Linux/macOS Compilation Shell Script
  const shKotlinBuilder = `#!/usr/bin/env bash
set -e
echo "======================================================================"
echo "   GRIMORIO - APLICACIÓN NATIVA ANDROID EN KOTLIN + ANDROID SDK       "
echo "======================================================================"

echo "[1/2] Dando permisos de ejecución a gradlew..."
chmod +x ./gradlew || true

echo "[2/2] Compilando APK nativo con Gradle..."
./gradlew assembleDebug

echo "======================================================================"
echo "¡APK generado con éxito en: app/build/outputs/apk/debug/app-debug.apk!"
echo "======================================================================"
`;
  zip.file('compilar_apk_nativo_kotlin.sh', shKotlinBuilder);

  // 19. GitHub Actions Workflow to compile APK in the Cloud for Free
  const githubActionsWorkflow = `name: Compilar APK Nativo de Android en Kotlin

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del código fuente Kotlin
        uses: actions/checkout@v4

      - name: Configurar Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Configurar Android SDK
        uses: android-actions/setup-android@v3

      - name: Dar permisos a Gradle Wrapper
        run: chmod +x ./gradlew || true

      - name: Compilar APK Debug con Gradle
        run: ./gradlew assembleDebug --no-daemon

      - name: Subir APK de Android generado como artefacto
        uses: actions/upload-artifact@v4
        with:
          name: Grimorio-Android-Kotlin-APK
          path: app/build/outputs/apk/debug/app-debug.apk
`;
  zip.folder('.github')?.folder('workflows')?.file('build-native-kotlin-apk.yml', githubActionsWorkflow);

  // 20. Complete documentation and guide in Spanish
  const readmeKotlin = `==============================================================================
   GRIMORIO - APLICACIÓN NATIVA ANDROID EN KOTLIN Y ANDROID SDK (100% OFFLINE)
==============================================================================

Este paquete es un proyecto NATIVO de Android completo, escrito en Kotlin 2.0
con el SDK de Android (Android SDK 34), Jetpack Compose, Material 3 y Room Database.

CARACTERÍSTICAS NATIVAS IMPLEMENTADAS EN KOTLIN:
------------------------------------------------------------------------------
✓ Arquitectura nativa en Kotlin con Room Database para almacenamiento offline en SQLite.
✓ Opción para ELIMINAR en cada sección (Historias, Capítulos, Personajes, Bestiario, Cronología, Notas).
✓ Interfaz Jetpack Compose moderna con tema oscuro fantástico (Dark Gold / Obsidian).
✓ Editor Markdown nativo con vista de palabras y guardado local.
✓ Datos pre-cargados de tu universo actual: ${universeName} (${docs.length} documentos, ${stories.length} historias).

CÓMO COMPILAR Y EJECUTAR:
------------------------------------------------------------------------------
MÉTODO 1: ABRIR EN ANDROID STUDIO (Recomendado para desarrolladores)
1. Abre Android Studio (Ladybug, Iguana, Hedgehog o superior).
2. Haz clic en "File" -> "Open..." y selecciona esta carpeta descomprimida.
3. Android Studio sincronizará Gradle automáticamente.
4. Conecta tu teléfono Android por USB (con depuración USB activada) o abre un emulador.
5. Haz clic en el botón verde "Run" (▶) o en "Build" -> "Build APK(s)".

MÉTODO 2: COMPILACIÓN RÁPIDA POR CONSOLA (Windows / Mac / Linux)
- En Windows: Haz doble clic en "compilar_apk_nativo_kotlin.bat".
- En Linux / macOS: Ejecuta "./compilar_apk_nativo_kotlin.sh".
El instalador se generará en:
app/build/outputs/apk/debug/app-debug.apk

MÉTODO 3: COMPILAR EN LA NUBE GRATIS (GitHub Actions)
Sube esta carpeta a un repositorio privado o público en GitHub.
El archivo ".github/workflows/build-native-kotlin-apk.yml" compilará
el archivo APK automáticamente en la nube y podrás descargarlo en la pestaña
"Actions" de GitHub directamente a tu teléfono.
==============================================================================
`;
  zip.file('LEEME_KOTLIN_ANDROID_STUDIO.txt', readmeKotlin);

  // Trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanName = universeName.replace(/[^a-zA-Z0-9]/g, '_') || 'Lore';
  a.download = `Grimorio_Android_Nativo_Kotlin_${cleanName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
