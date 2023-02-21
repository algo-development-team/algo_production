export const PromptsContainer = () => {
  return (
    <div style={{ marginTop: '1rem' }}>
      <div
        style={{
          backgroundColor: '#282828',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '90%',
            marginTop: '10px',
            marginBottom: '10px',
            display: 'flex',
          }}
        >
          <input
            style={{
              fontSize: '16px',
              display: 'flex',
              flexGrow: 1,
              height: '24px',
              border: 'none',
              padding: '10px',
              paddingLeft: '10px',
              fontWeight: 400,
              backgroundColor: '#222222',
              color: 'inherit',
              borderTopLeftRadius: '5px',
              borderBottomLeftRadius: '5px',
              outline: 'none',
            }}
          />
          <div
            style={{
              fontSize: '16px',
              height: '44px',
              border: 'none',
              fontWeight: 400,
              backgroundColor: '#222222',
              color: 'inherit',
              borderRadius: 0,
              borderTopRightRadius: '5px',
              borderBottomRightRadius: '5px',
              outline: 'none',
            }}
          >
            {/* overlap the elements on top of each other */}
            <div
              style={{
                display: 'block',
                position: 'relative',
                marginRight: '24px',
                marginTop: '14px',
                paddingRight: '10px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '24px solid #444444',
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  position: 'absolute',
                }}
              ></div>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '12px solid #222222',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                  position: 'absolute',
                  marginTop: '4px',
                  zIndex: 1,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          backgroundColor: '#282828',
          height: '28vh',
          overflowX: 'scroll',
        }}
      ></div>
      <div
        style={{
          backgroundColor: '#282828',
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
          height: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <i class='arrow-lg up' />
      </div>
    </div>
  )
}
