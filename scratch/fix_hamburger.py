with open(r"c:\Users\Admin\OneDrive\Desktop\web2\js\main.js", 'r', encoding='utf-8') as f:
    content = f.read()

old = """// Mobile hamburger menu\nfunction setupHamburgerMenu() {\n    const hamburger = document.querySelector('.hamburger');\n    const navMenu = document.querySelector('.nav-menu');\n    \n    if (hamburger && navMenu) {\n        hamburger.addEventListener('click', () => {\n            navMenu.classList.toggle('active');\n            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';\n        });\n        \n        // Close menu when a link is clicked\n        navMenu.querySelectorAll('a').forEach(link => {\n            link.addEventListener('click', () => {\n                if (window.innerWidth <= 768) {\n                    navMenu.style.display = 'none';\n                    navMenu.classList.remove('active');\n                }\n            });\n        });\n    }\n}\n"""

new = """// Mobile hamburger menu\nfunction setupHamburgerMenu() {\n    const hamburger = document.querySelector('.hamburger');\n    const navMenu = document.querySelector('.nav-menu');\n\n    if (hamburger && navMenu) {\n        hamburger.addEventListener('click', () => {\n            navMenu.classList.toggle('active');\n        });\n\n        // Close menu when a link is clicked\n        navMenu.querySelectorAll('a').forEach(link => {\n            link.addEventListener('click', () => {\n                if (window.innerWidth <= 768) {\n                    navMenu.classList.remove('active');\n                }\n            });\n        });\n\n        // Close menu when clicking outside navbar\n        document.addEventListener('click', (e) => {\n            if (!e.target.closest('.navbar')) {\n                navMenu.classList.remove('active');\n            }\n        });\n    }\n}\n"""

if old in content:
    content = content.replace(old, new)
    with open(r"c:\Users\Admin\OneDrive\Desktop\web2\js\main.js", 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("FAIL - old string not found")
    print(repr(old))
