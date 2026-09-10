import { useState } from 'react';
import { View } from 'react-native';
import {
  Badge, Button, Card, ConfirmSheet, FilterChips, ListRow, Money, QtyStepper,
  ResultSheet, Screen, SearchBar, SectionHeader, StatCard, StatRow, Text, type ResultState,
} from '@/src/components';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function KitchenSink() {
  const { spacing } = useTheme();
  const [chip, setChip] = useState('a');
  const [sel, setSel] = useState(1);
  const [qty, setQty] = useState(3);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);

  return (
    <Screen>
      <SectionHeader title="Typography" />
      <Card>
        <Text variant="h1">Heading 1</Text>
        <Text variant="h2">Heading 2</Text>
        <Text variant="title">Title</Text>
        <Text variant="body">Body text</Text>
        <Text variant="caption" tone="muted">Caption muted</Text>
      </Card>

      <SectionHeader title="Buttons" />
      <Button title="Primary" onPress={() => {}} />
      <Button title="Secondary" variant="secondary" onPress={() => {}} />
      <Button title="Danger" variant="danger" onPress={() => {}} />
      <Button title="Loading" loading onPress={() => {}} />

      <SectionHeader title="Badges" />
      <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
        <Badge label="Success" tone="success" />
        <Badge label="Warning" tone="warning" />
        <Badge label="Info" tone="info" />
        <Badge label="Special" tone="special" />
        <Badge label="Neutral" tone="neutral" />
      </View>

      <SectionHeader title="Money" />
      <Money value={1234567.5} currency="JOD" variant="h2" />

      <SectionHeader title="Stat cards" />
      <StatRow>
        <StatCard label="Open" value="12" />
        <StatCard label="Overdue" value="3" tone="danger" />
      </StatRow>

      <SectionHeader title="Search / chips" />
      <SearchBar value="" onChangeText={() => {}} />
      <FilterChips
        value={chip}
        onChange={setChip}
        options={[
          { value: 'a', label: 'One' },
          { value: 'b', label: 'Two' },
          { value: 'c', label: 'Three' },
        ]}
      />

      <SectionHeader title="List rows (selected state)" />
      {[1, 2].map((i) => (
        <ListRow
          key={i}
          title={`Row ${i}`}
          subtitle="Subtitle"
          selected={sel === i}
          chevron={false}
          onPress={() => setSel(i)}
        />
      ))}

      <SectionHeader title="Qty stepper" />
      <QtyStepper value={qty} onChange={setQty} />

      <SectionHeader title="Sheets" />
      <Button title="Confirm sheet" variant="secondary" onPress={() => setConfirm(true)} />
      <Button title="Success sheet" variant="secondary" onPress={() => setResult({ kind: 'success', title: 'Done', reference: 'REF-001', referenceLabel: 'Order' })} />
      <Button title="Failure sheet" variant="secondary" onPress={() => setResult({ kind: 'error', title: 'Failed', description: 'Something went wrong.' })} />

      <ConfirmSheet
        visible={confirm}
        title="Confirm something?"
        description="This is a demo confirm sheet."
        onConfirm={() => setConfirm(false)}
        onCancel={() => setConfirm(false)}
      />
      <ResultSheet
        state={result}
        onPrimary={() => setResult(null)}
        onCancel={result?.kind === 'error' ? () => setResult(null) : undefined}
      />
    </Screen>
  );
}
