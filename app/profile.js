document.addEventListener('DOMContentLoaded', function() {
    const profileImage = document.getElementById('profileImage');
    const fileInput = document.getElementById('file-path');
    
    // loads the saved profile picture from localStorage
    const savedProfilePic = localStorage.getItem('userProfilePic');
    if (savedProfilePic) {
        profileImage.src = savedProfilePic;
    }
    
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            // checks if file is an image
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file (JPEG, PNG, JPG)');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // updates the profile image
                profileImage.src = e.target.result;
                
                // save to localStorage
                localStorage.setItem('userProfilePic', e.target.result);
            };
            
            reader.readAsDataURL(file);
        }
    });
  });