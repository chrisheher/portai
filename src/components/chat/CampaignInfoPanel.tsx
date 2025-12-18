'use client';

import React from 'react';

interface Link {
  name: string;
  url: string;
}

interface CampaignInfoPanelProps {
  title: string;
  description?: string;
  campaignListDescription?: string;
  impact?: { stat: string }[];
  links?: Link[];
  onClose: () => void;
}

const CampaignInfoPanel: React.FC<CampaignInfoPanelProps> = ({
  title,
  description,
  campaignListDescription,
  impact,
  links,
  onClose
}) => {
  console.log('🎨 CampaignInfoPanel rendering with:', { title, description, campaignListDescription, impact, links });
  
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        backgroundColor: '#dcd3c3',
        borderRadius: '12px',
        padding: '40px',
        zIndex: 2000,
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: '#5e4631',
          color: '#dcd3c3',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}
      >
        ×
      </button>

      {/* Campaign Title */}
      <h2
        style={{
          color: '#5e4631',
          fontFamily: 'Arial, sans-serif',
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '24px',
          paddingRight: '40px'
        }}
      >
        {title}
      </h2>

      {/* Campaign Description */}
      {description && (
        <div style={{ marginBottom: '24px' }}>
          <h3
            style={{
              color: '#5e4631',
              fontFamily: 'Arial, sans-serif',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            Campaign Overview
          </h3>
          <p
            style={{
              color: '#5e4631',
              fontFamily: 'Arial, sans-serif',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: 0
            }}
          >
            {description}
          </p>
        </div>
      )}

      {/* Campaign List Description */}
      {campaignListDescription && (
        <div style={{ marginBottom: '24px' }}>
          <h3
            style={{
              color: '#5e4631',
              fontFamily: 'Arial, sans-serif',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            About This Work
          </h3>
          <p
            style={{
              color: '#5e4631',
              fontFamily: 'Arial, sans-serif',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: 0
            }}
          >
            {campaignListDescription}
          </p>
        </div>
      )}

      {/* Impact Stats */}
      {impact && impact.length > 0 && (
        <div style={{ marginBottom: links && links.length > 0 ? '24px' : '0' }}>
          <h3
            style={{
              color: '#5e4631',
              fontFamily: 'Arial, sans-serif',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            Impact & Results
          </h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}
          >
            {impact.map((item, index) => (
              <li
                key={index}
                style={{
                  color: '#5e4631',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginBottom: '12px',
                  paddingLeft: '20px',
                  position: 'relative'
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: '0',
                    color: '#5e4631',
                    fontWeight: 'bold'
                  }}
                >
                  •
                </span>
                {item.stat}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Campaign Links */}
      {links && links.length > 0 && (
        <div>
          <h3
            style={{
              color: '#5e4631',
              fontFamily: 'Arial, sans-serif',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            View Campaign Assets
          </h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}
          >
            {links.map((link, index) => (
              <li
                key={index}
                style={{
                  marginBottom: '8px'
                }}
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#5e4631',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '16px',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#8c6a48';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#5e4631';
                  }}
                >
                  {link.name} →
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CampaignInfoPanel;