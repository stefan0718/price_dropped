window.addEventListener('load', () => {
    var form = document.querySelector('.needs-validation');
    var input = document.getElementById('query');
    var invalidFeedback = document.getElementsByClassName('invalid-feedback');
    form.addEventListener('submit', e => {
        e.preventDefault();
        e.stopPropagation();
        // only allow digits, letters and middle white space
        if (!input.value.trim().match(/^[0-9a-zA-Z\s]+$/)) {
            invalidFeedback[0].style.display = 'block';
            invalidFeedback[0].classList.remove('fade-out');
            invalidFeedback[0].classList.add('fade-in');
        }
        else {
            $.ajax({
                type: 'POST',
                url: '/',
                data: {
                    "query": input.value.trim(),
                    "userAgent": navigator.userAgent
                }
            }).done((data) => {
                console.log(data);
            });
            if (invalidFeedback[0].style.display === 'block') {
                invalidFeedback[0].classList.remove('fade-in');
                invalidFeedback[0].classList.add('fade-out');
                setTimeout(() => {
                    invalidFeedback[0].style.display = 'none';
                }, 1000);
            }
        }
    }, false);
}, false);

