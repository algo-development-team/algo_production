export const EventsContainer = ({
  eventsClosed,
  setEventsClosed,
  promptsClosed,
}) => {
  return (
    <div style={{ marginTop: '1rem' }}>
      <div
        style={{
          backgroundColor: '#282828',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          height: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {!(promptsClosed && !eventsClosed) && (
          <i
            class={`arrow-lg ${eventsClosed ? 'up' : 'down'}`}
            onClick={() => setEventsClosed(!eventsClosed)}
          />
        )}
      </div>
      <div
        style={{
          backgroundColor: '#282828',
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
          height: eventsClosed ? 0 : promptsClosed ? '62vh' : '34vh',
          overflowX: 'scroll',
        }}
      ></div>
    </div>
  )
}
