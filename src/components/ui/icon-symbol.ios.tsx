import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

const IOS_MAPPING: Record<string, SymbolViewProps['name']> = {
  'file-edit': 'pencil',
  'document-text-outline': 'doc.text',
  'information-circle': 'info.circle',
  'banknote.fill': 'banknote',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const resolvedName = IOS_MAPPING[name as string] || name;

  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={resolvedName}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
