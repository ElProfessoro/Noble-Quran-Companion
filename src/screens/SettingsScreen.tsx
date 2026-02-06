import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useSettingsStore, ThemeMode } from '../store/settingsStore';
import { themes } from '../constants/theme';
import { resetDatabase, getVerseCount } from '../db/database';

const SettingsScreen = () => {
    const {
        showArabic, toggleArabic,
        showPhonetic, togglePhonetic,
        showTranslation, toggleTranslation,
        theme: themeMode, setTheme
    } = useSettingsStore();

    const [dbInfo, setDbInfo] = React.useState<string>("Chargement...");

    React.useEffect(() => {
        getVerseCount().then(c => setDbInfo(`Versets: ${c}`));
    }, []);

    const theme = themes[themeMode];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Paramètres</Text>

                {/* Section: Affichage (Combos) */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>Affichage</Text>

                    <View style={[styles.row, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.text }]}>Texte Arabe</Text>
                        <Switch
                            value={showArabic}
                            onValueChange={toggleArabic}
                            trackColor={{ false: theme.secondary, true: theme.primary }}
                        />
                    </View>
                    <View style={[styles.row, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.text }]}>Phonétique</Text>
                        <Switch
                            value={showPhonetic}
                            onValueChange={togglePhonetic}
                            trackColor={{ false: theme.secondary, true: theme.primary }}
                        />
                    </View>
                    <View style={[styles.row, { borderBottomColor: theme.border, borderBottomWidth: 0 }]}>
                        <Text style={[styles.label, { color: theme.text }]}>Traduction Française</Text>
                        <Switch
                            value={showTranslation}
                            onValueChange={toggleTranslation}
                            trackColor={{ false: theme.secondary, true: theme.primary }}
                        />
                    </View>
                </View>

                {/* Section: Thème */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>Thème</Text>
                    <View style={styles.themeRow}>
                        {(['light', 'sepia', 'oled'] as ThemeMode[]).map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                style={[
                                    styles.themeOption,
                                    { backgroundColor: themes[mode].background, borderColor: theme.border },
                                    themeMode === mode && { borderColor: theme.primary, borderWidth: 2 }
                                ]}
                                onPress={() => setTheme(mode)}
                            >
                                <Text style={[styles.themeText, { color: themes[mode].text }]}>
                                    {mode === 'light' ? 'Clair' : mode === 'sepia' ? 'Sépia' : 'OLED'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Section: Debug */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: 'red' }]}>Zone de Danger</Text>
                    <Text style={{ marginBottom: 10, color: theme.text }}>Database Info: {dbInfo}</Text>
                    <TouchableOpacity
                        style={[styles.row, { borderBottomColor: theme.border, justifyContent: 'center' }]}
                        onPress={async () => {
                            setDbInfo("Réinitialisation...");
                            await resetDatabase();
                            // Force delay to ensure transaction commits
                            setTimeout(async () => {
                                const newCount = await getVerseCount();
                                setDbInfo(`Versets: ${newCount}`);
                                alert(`Base de données réinitialisée. Versets: ${newCount}.`);
                            }, 1000);
                        }}
                    >
                        <Text style={{ color: 'red', fontWeight: 'bold' }}>Réinitialiser la Base de Données</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    label: {
        fontSize: 16,
    },
    themeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    themeOption: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    themeText: {
        fontWeight: 'bold',
    },
});

export default SettingsScreen;
