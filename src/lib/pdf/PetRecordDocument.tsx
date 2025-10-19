import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface Pet {
  name: string
  species: string
  breed?: string
  birth_date?: string
  gender?: string
}

interface Walk {
  walked_at: string
  duration_minutes?: number
  distance_km?: number
  notes?: string
}

interface Meal {
  fed_at: string
  food_type?: string
  amount?: string
  notes?: string
}

interface Trait {
  trait_name: string
  trait_value: string
  notes?: string
}

interface Meta {
  meta_key: string
  meta_value: string
}

interface PetRecordDocumentProps {
  pet: Pet
  walks: Walk[]
  meals: Meal[]
  traits: Trait[]
  metas: Meta[]
  startDate?: string
  endDate?: string
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2563eb',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 100,
    fontWeight: 'bold',
  },
  detailValue: {
    flex: 1,
  },
  recordItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  recordHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  recordDetail: {
    fontSize: 9,
    color: '#4b5563',
    marginBottom: 2,
  },
  recordNotes: {
    fontSize: 9,
    marginTop: 3,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
})

export default function PetRecordDocument({
  pet,
  walks,
  meals,
  traits,
  metas,
  startDate,
  endDate,
}: PetRecordDocumentProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{pet.name}</Text>
          <Text style={styles.subtitle}>
            {pet.species}
            {pet.breed && ` - ${pet.breed}`}
          </Text>
          {(startDate || endDate) && (
            <Text style={styles.subtitle}>
              Period: {startDate ? formatDateOnly(startDate) : 'All'} -{' '}
              {endDate ? formatDateOnly(endDate) : 'Now'}
            </Text>
          )}
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleString()}
          </Text>
        </View>

        {/* Pet Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pet Details</Text>
          {pet.birth_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Birth Date:</Text>
              <Text style={styles.detailValue}>
                {formatDateOnly(pet.birth_date)}
              </Text>
            </View>
          )}
          {pet.gender && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gender:</Text>
              <Text style={styles.detailValue}>{pet.gender}</Text>
            </View>
          )}
        </View>

        {/* Walks */}
        {walks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Walks ({walks.length})</Text>
            {walks.map((walk, index) => (
              <View key={index} style={styles.recordItem}>
                <Text style={styles.recordHeader}>
                  {formatDate(walk.walked_at)}
                </Text>
                {walk.duration_minutes && (
                  <Text style={styles.recordDetail}>
                    Duration: {walk.duration_minutes} minutes
                  </Text>
                )}
                {walk.distance_km && (
                  <Text style={styles.recordDetail}>
                    Distance: {walk.distance_km} km
                  </Text>
                )}
                {walk.notes && (
                  <Text style={styles.recordNotes}>{walk.notes}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Meals */}
        {meals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meals ({meals.length})</Text>
            {meals.map((meal, index) => (
              <View key={index} style={styles.recordItem}>
                <Text style={styles.recordHeader}>{formatDate(meal.fed_at)}</Text>
                {meal.food_type && (
                  <Text style={styles.recordDetail}>
                    Food: {meal.food_type}
                  </Text>
                )}
                {meal.amount && (
                  <Text style={styles.recordDetail}>Amount: {meal.amount}</Text>
                )}
                {meal.notes && (
                  <Text style={styles.recordNotes}>{meal.notes}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Traits */}
        {traits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Traits</Text>
            {traits.map((trait, index) => (
              <View key={index} style={styles.recordItem}>
                <Text style={styles.recordHeader}>{trait.trait_name}</Text>
                <Text style={styles.recordDetail}>{trait.trait_value}</Text>
                {trait.notes && (
                  <Text style={styles.recordNotes}>{trait.notes}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Meta */}
        {metas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            {metas.map((meta, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{meta.meta_key}:</Text>
                <Text style={styles.detailValue}>{meta.meta_value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Record Pet - Pet Management System
        </Text>
      </Page>
    </Document>
  )
}
