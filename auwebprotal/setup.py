from setuptools import setup

setup(name='auwebportal',
      version='1.0',
      description='A Python API using Flask microframework, to retrieve student details from Anna University web portal in JSON fromat.',
      author='Arunvel Sriram',
      author_email='arunvelsriram@gmail.com',
      url='http://www.python.org/sigs/distutils-sig/',
      install_requires=['Flask>=0.10.1', 'wtforms', 'flask-wtf', 'requests', 'beautifulsoup4'],
     )
