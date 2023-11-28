import numpy as np
import scipy.io.wavfile as wavfile
import scipy.signal as signal
import matplotlib.pyplot as plt

# Load audio file
filepath = "filtered"
sample_rate, audio_data = wavfile.read(filepath)

# Function to apply filters
def apply_filter(audio, filter_type, cutoff_freq, sample_rate):
    if filter_type == 'lowpass':
        b, a = signal.butter(5, cutoff_freq / (sample_rate / 2), 'low')
    elif filter_type == 'highpass':
        b, a = signal.butter(5, cutoff_freq / (sample_rate / 2), 'high')
    else:
        raise ValueError("Filter type not supported")
    
    return signal.lfilter(b, a, audio)

# Define filter parameters
filter_type = 'lowpass'  # Change this to 'highpass' for high-pass filter
cutoff_frequency = 400  # Cutoff frequency in Hz

# Apply filter
filtered_audio = apply_filter(audio_data[:, 0], filter_type, cutoff_frequency, sample_rate)

# Save filtered audio to a new WAV file
filtered_filename = f'filtered_{filter_type}.wav'
wavfile.write(filtered_filename, sample_rate, np.int16(filtered_audio))

# Calculate spectrum before and after filtering
frequencies, spectrum_before = signal.periodogram(audio_data[:, 0], sample_rate)
frequencies, spectrum_after = signal.periodogram(filtered_audio, sample_rate)

# Plot the spectra (optional)
plt.figure(figsize=(10, 6))

plt.subplot(2, 1, 1)
plt.semilogy(frequencies, spectrum_before)
plt.title('Original Audio Spectrum')
plt.xlabel('Frequency (Hz)')
plt.ylabel('Amplitude')

plt.subplot(2, 1, 2)
plt.semilogy(frequencies, spectrum_after)
plt.title(f'Filtered Audio Spectrum, {filter_type} at {cutoff_frequency} Hz')
plt.xlabel('Frequency (Hz)')
plt.ylabel('Amplitude')

plt.tight_layout()
plt.show()
