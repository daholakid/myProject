const UserModel = require('../models/users_model.js');
const ipc = require('electron').ipcRenderer;
const { remote } = require('electron');
ipc.on('course-selected', async(e, course) => {
    const questions = await UserModel.getQuiz(course.id);

    function buildQuiz() {
        const output = [];
        questions.forEach((currentQuestion, questionNumber) => {
            const answersHTML = [];
            for (answer of currentQuestion.answers) {
                answersHTML.push(
                    `<label>
               <input type="checkbox" name="question${questionNumber}" value="${answer.id}">
                ${answer.content}
             </label>`
                );
            }
            output.push(
                `<div class="slide">
             <div class="question"> ${currentQuestion.content} </div>
             <div class="answers"> ${answersHTML.join("")} </div>
           </div>`
            );
        });
        quizContainer.innerHTML = output.join("");
    }

    function showResults() {
        const answerContainers = quizContainer.querySelectorAll(".answers");
        let numCorrect = 0;

        questions.forEach((currentQuestion, questionNumber) => {
            let i = 0;
            let checkboxes = document.getElementsByName(`question${questionNumber}`);

            let answerIds = [];
            let correctIds = [];
            for (let i = 0, n = checkboxes.length; i < n; i++) {
                if (checkboxes[i].checked) {
                    answerIds.push(checkboxes[i].value);
                }
            }
            answerIds.sort();
            correctIds = currentQuestion.correctId.split(",");
            correctIds.sort();
            if (isEqual(answerIds, correctIds)) {
                numCorrect++;
                answerContainers[questionNumber].style.color = "lightgreen";
            } else {
                answerContainers[questionNumber].style.color = "red";
            }
        });

        if (confirm("Bạn có đồng ý với câu trả lời")) {
            document.getElementById('quiz').style.visibility = "hidden";
            document.getElementById('previous').style.visibility = "hidden";
            document.getElementById('next').style.visibility = "hidden";
            document.getElementById('submit').style.visibility = "hidden";
            document.getElementById('submitquiz').style.visibility = "visible";
            resultsContainer.innerHTML = `Số câu trả lời đúng:${numCorrect} </br> Tổng số câu hỏi: ${questions.length}`;
        } else {
            alert("Bạn muốn làm lại??")
        }
    }

    function showSlide(n) {
        slides[currentSlide].classList.remove("active-slide");
        slides[n].classList.add("active-slide");
        currentSlide = n;

        if (currentSlide === 0) {
            previousButton.style.display = "none";
        } else {
            previousButton.style.display = "inline-block";
        }

        if (currentSlide === slides.length - 1) {
            nextButton.style.display = "none";
            submitButton.style.display = "inline-block";
        } else {
            nextButton.style.display = "inline-block";
            submitButton.style.display = "none";
        }

    }

    function showNextSlide() {
        showSlide(currentSlide + 1);
    }

    function showPreviousSlide() {
        showSlide(currentSlide - 1);
    }

    const quizContainer = document.getElementById("quiz");
    const resultsContainer = document.getElementById("results");
    const submitButton = document.getElementById("submit");

    buildQuiz();

    const previousButton = document.getElementById("previous");
    const nextButton = document.getElementById("next");
    const slides = document.querySelectorAll(".slide");
    let currentSlide = 0;

    showSlide(0);

    submitButton.addEventListener("click", showResults);
    previousButton.addEventListener("click", showPreviousSlide);
    nextButton.addEventListener("click", showNextSlide);

    var isEqual = function(value, other) {

        // Get the value type
        var type = Object.prototype.toString.call(value);

        // If the two objects are not the same type, return false
        if (type !== Object.prototype.toString.call(other)) return false;

        // If items are not an object or array, return false
        if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

        // Compare the length of the length of the two items
        var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
        var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
        if (valueLen !== otherLen) return false;

        // Compare two items
        var compare = function(item1, item2) {

            // Get the object type
            var itemType = Object.prototype.toString.call(item1);

            // If an object or array, compare recursively
            if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                if (!isEqual(item1, item2)) return false;
            }

            // Otherwise, do a simple comparison
            else {

                // If the two items are not the same type, return false
                if (itemType !== Object.prototype.toString.call(item2)) return false;

                // Else if it's a function, convert to a string and compare
                // Otherwise, just compare
                if (itemType === '[object Function]') {
                    if (item1.toString() !== item2.toString()) return false;
                } else {
                    if (item1 !== item2) return false;
                }

            }
        };

        // Compare properties
        if (type === '[object Array]') {
            for (var i = 0; i < valueLen; i++) {
                if (compare(value[i], other[i]) === false) return false;
            }
        } else {
            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    if (compare(value[key], other[key]) === false) return false;
                }
            }
        }

        // If nothing failed, return true
        return true;

    };


});

function startTimer(duration, display) {
    var timer = duration,
        minutes, seconds;
    setInterval(function() {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}

window.onload = function() {
    var fiveMinutes = 60 * 5,
        display = document.querySelector('#timer');
    startTimer(fiveMinutes, display);
    // alert("Time's up");
    // window.close();
};